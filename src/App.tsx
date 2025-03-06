import { useEffect, useState } from "react";
import "./App.css";
import Sidebar from "./components/Sidebar";

// 定义消息类型
interface Message {
  content: string;
  isUser: boolean;
  reasoningContent?: string | null;
  isReasoningCollapsed: boolean;
}

// 定义消息响应类型
type SendMessageResponse = {
  success: boolean;
  data?: { message: string };
  error?: string;
}

// 定义流式消息类型
interface StreamMessage {
  type: 'chat-stream';
  data: {
    content: string;
    reasoning_content: string;
    done: boolean;
  };
}

function App() {
  const [messages, setMessages] = useState<Array<Message>>([]);
  const toggleReasoning = (index: number) => {
    setMessages(prevMessages => {
      const newMessages = [...prevMessages];
      if (newMessages[index]) {
        newMessages[index] = {
          ...newMessages[index],
          isReasoningCollapsed: !newMessages[index].isReasoningCollapsed
        };
      }
      return newMessages;
    });
  };
  const [inputValue, setInputValue] = useState("");
  const [model, setModel] = useState("deepseek-chat");
  const [apiKey, setApiKey] = useState("");
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [currentStreamMessage, setCurrentStreamMessage] = useState("");
  const [currentReasoningContent, setCurrentReasoningContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // 初始化时从storage获取API密钥
  useEffect(() => {
    chrome.storage.local.get('apiKey').then((result) => {
      if (result.apiKey) {
        setApiKey(result.apiKey);
      }
    });

    // 添加流式消息监听器
    const handleStreamMessage = (message: StreamMessage) => {
      if (message.type === 'chat-stream') {
        const { content, reasoning_content, done } = message.data;
        if (done) {
          // 流式消息完成，将累积的消息添加到消息列表
          setMessages(prevMessages => {
            const newMessages = [...prevMessages];
            // 移除最后一条临时消息
            if (isGenerating) {
              newMessages.pop();
            }
            // 添加完整的AI响应
            const newMessage: Message = {
              content: currentStreamMessage,
              reasoningContent: model === 'deepseek-reasoner' ? currentReasoningContent : null,
              isReasoningCollapsed: false,
              isUser: false
            };
            return [...newMessages, newMessage];
          });
          setCurrentStreamMessage("");
          setCurrentReasoningContent("");
          setIsGenerating(false);
        } else {
          // 更新当前流式消息
          setCurrentStreamMessage(prev => {
            const newMessage = prev + content;
            // 更新消息列表中的临时消息
            setMessages(prevMessages => {
              const newMessages = [...prevMessages];
              if (isGenerating) {
                // 更新最后一条消息
                newMessages[newMessages.length - 1] = {
                  content: newMessage,
                  reasoningContent: model === 'deepseek-reasoner' ? reasoning_content : null,
                  isUser: false,
                  isReasoningCollapsed: false
                };
              } else {
                // 添加新的临时消息
                newMessages.push({
                  content: newMessage,
                  reasoningContent: model === 'deepseek-reasoner' ? reasoning_content : null,
                  isUser: false,
                  isReasoningCollapsed: false
                });
                setIsGenerating(true);
              }
              return newMessages;
            });
            return newMessage;
          });
          if (model === 'deepseek-reasoner') {
            setCurrentReasoningContent(reasoning_content);
          }
        }
      }
    };

    chrome.runtime.onMessage.addListener(handleStreamMessage);
    return () => {
      chrome.runtime.onMessage.removeListener(handleStreamMessage);
    };
  }, [currentReasoningContent, currentStreamMessage, isGenerating, model]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    // 添加用户消息到消息列表
    setMessages([...messages, { content: inputValue, isUser: true, isReasoningCollapsed: false }]);
    setInputValue("");
    setIsGenerating(false); // 重置生成状态

    try {
      // 发送消息到background script
      const response = await chrome.runtime.sendMessage<SendMessageResponse>({
        type: "chat",
        content: inputValue
      });

      if (!response.success) {
        throw new Error(response.error || "未知错误");
      }
    } catch (error) {
      console.error("发送消息失败:", error);
      alert("发送消息失败，请重试");
    }
  };
  const handleModelChange = async (newModel: string) => {
    setModel(newModel);
    try {
      await chrome.storage.local.set({ model: newModel });
    } catch (error) {
      console.error("保存模型选择失败:", error);
      alert("保存模型选择失败，请重试");
    }
  };
  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      alert("请输入有效的API密钥");
      return;
    }

    try {
      await chrome.storage.local.set({ apiKey });
      setShowApiKeyInput(false);
    } catch (error) {
      console.error("保存API密钥失败:", error);
      alert("保存API密钥失败，请重试");
    }
  };
  return (
    <Sidebar>
      <div className="chat-container">
        <div className="settings-container">
          <div className="model-selector">
            <select
              value={model}
              onChange={(e) => handleModelChange(e.target.value)}
              className="model-select"
            >
              <option value="deepseek-chat">DeepSeek-V3</option>
              <option value="deepseek-reasoner">DeepSeek-R1</option>
            </select>
          </div>
          <div className="api-key-config">
            <button onClick={() => setShowApiKeyInput(!showApiKeyInput)}>
              {showApiKeyInput ? "取消" : "配置API密钥"}
            </button>
            {showApiKeyInput && (
              <div className="api-key-input-container">
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="请输入API密钥"
                />
                <button onClick={handleSaveApiKey}>保存</button>
              </div>
            )}
          </div>
        </div>
        <div className="messages-container">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`message ${message.isUser ? "user-message" : "ai-message"}`}
            >
              {model === 'deepseek-reasoner' && message.reasoningContent && (
                <>
                  <span
                    className="toggle-reasoning"
                    onClick={() => toggleReasoning(index)}
                  >
                    {message.isReasoningCollapsed ? '显示推理过程' : '隐藏推理过程'}
                  </span>
                  <div className={`reasoning-content ${message.isReasoningCollapsed ? 'collapsed' : ''}`}>
                    {message.reasoningContent}
                  </div>
                </>
              )}
              {message.content}
            </div>
          ))}
        </div>
        <div className="input-container">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyUp={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="输入消息..."
          />
          <button onClick={handleSendMessage}>发送</button>
        </div>
      </div>
    </Sidebar>
  );
}

export default App;
