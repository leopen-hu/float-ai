import { OpenAI } from 'openai';

interface ChatMessage {
  type: 'chat';
  content: string;
}

interface ChatResponse {
  message: string;
  timestamp: string;
}

// 扩展OpenAI的Delta类型
interface ExtendedDelta extends OpenAI.ChatCompletionChunk.Choice.Delta {
  reasoning_content?: string;
}

// 在扩展安装或更新时初始化
chrome.runtime.onInstalled.addListener(() => {
  console.log('扩展已安装/更新');
});

// 监听扩展图标点击事件
chrome.action.onClicked.addListener(async (tab) => {
  console.log('扩展图标被点击');
  try {
    console.log('尝试打开侧边栏');
    if (tab.id) {
      await chrome.sidePanel.open({ tabId: tab.id });
      console.log('侧边栏打开成功');
    }
  } catch (error) {
    console.error('执行过程中出错:', error);
  }
});

// 监听来自popup页面的消息
chrome.runtime.onMessage.addListener((message: ChatMessage, _sender, sendResponse) => {
  if (message.type === 'chat') {
    // 处理聊天消息
    handleChatMessage(message.content)
      .then(response => {
        sendResponse({ success: true, data: response });
      })
      .catch(error => {
        sendResponse({ success: false, error: error.message });
      });
    return true; // 保持消息通道开启
  }
});

// 处理聊天消息的函数
async function handleChatMessage(content: string): Promise<ChatResponse> {
  try {
    // 从storage中获取API密钥
    const { apiKey } = await chrome.storage.local.get('apiKey');
    
    if (!apiKey) {
      throw new Error('请先配置API密钥');
    }

    const openai = new OpenAI({
      baseURL: 'https://api.deepseek.com',
      apiKey: apiKey
    });

    // 从storage中获取当前选择的模型
    const { model = 'deepseek-chat' } = await chrome.storage.local.get('model');

    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: content }
      ],
      model: model,
      stream: true
    });

    let fullMessage = '';
    let reasoningContent = '';
    for await (const chunk of completion) {
      const content = (chunk.choices[0]?.delta as ExtendedDelta)?.content || '';
      const reasoning = (chunk.choices[0]?.delta as ExtendedDelta)?.reasoning_content || '';
      fullMessage += content;
      reasoningContent += reasoning;
      // 发送流式数据到前端
      chrome.runtime.sendMessage({
        type: 'chat-stream',
        data: {
          content: content,
          reasoning_content: reasoningContent,
          done: false
        }
      });
    }

    // 发送完成信号
    chrome.runtime.sendMessage({
      type: 'chat-stream',
      data: {
        content: '',
        reasoning_content: '',
        done: true
      }
    });

    return {
      message: fullMessage,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('处理聊天消息时出错:', error);
    throw error;
  }
}
