import { useEffect, useState } from "react";
import "./App.css";
import Sidebar from "./components/Sidebar";
import { Message, StreamMessage } from "./types/message";
import { MessageService } from "./services/messageService";
import MessageList from "./components/MessageList";

function App() {
  const [messages, setMessages] = useState<Array<Message>>([]);
  const [inputValue, setInputValue] = useState("");
  const [model, setModel] = useState("deepseek-chat");
  const [apiKey, setApiKey] = useState("");
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);

  // 初始化时从storage获取API密钥
  useEffect(() => {
    chrome.storage.local.get("apiKey").then((result) => {
      if (result.apiKey) {
        setApiKey(result.apiKey);
      }
    });

    // 添加流式消息监听器
    const messageService = MessageService.getInstance();
    const handleStreamMessage = (message: StreamMessage) => {
      messageService.handleStreamMessage(message, model, setMessages);
    };

    chrome.runtime.onMessage.addListener(handleStreamMessage);
    return () => {
      chrome.runtime.onMessage.removeListener(handleStreamMessage);
    };
  }, [model]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    // 添加用户消息到消息列表
    setMessages([
      ...messages,
      { content: inputValue, isUser: true, isReasoningCollapsed: false },
    ]);
    setInputValue("");

    try {
      // 使用MessageService发送消息
      await MessageService.getInstance().sendMessage(inputValue);
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
              className="model-select">
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
        <MessageList messages={messages} />
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
