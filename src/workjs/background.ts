import { ApiService } from './services/apiService'
import { promptService } from './services/promptService'

// 在扩展安装或更新时初始化
chrome.runtime.onInstalled.addListener(() => {
  console.log('扩展已安装/更新')
})

// 监听扩展图标点击事件
chrome.action.onClicked.addListener(async (tab) => {
  console.log('扩展图标被点击')
  try {
    console.log('尝试打开侧边栏')
    if (tab.id) {
      await chrome.sidePanel.open({ tabId: tab.id })
      console.log('侧边栏打开成功')
    }
  } catch (error) {
    console.error('执行过程中出错:', error)
  }
})

// 监听来自popup页面和内容脚本的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'not-stream') {
    ApiService.getInstance()
      .chatCompletion(message.content)
      .then((response) => {
        console.log('bg resp:', response)
        sendResponse({ success: true, data: response })
      })
      .catch((error) => {
        sendResponse({ success: false, error: error.message })
      })
    return true
  }
  if (message.type === 'stream') {
    // 如果消息来自内容脚本，尝试打开侧边栏
    if (sender.tab && sender.tab.id) {
      chrome.sidePanel.open({ tabId: sender.tab.id }).catch((error) => {
        console.error('打开侧边栏失败:', error)
      })
    }

    // 使用ApiService处理聊天消息
    ApiService.getInstance()
      .streamChatCompletion(message.content)
      .then(() => {
        sendResponse({ success: true })
      })
      .catch((error) => {
        sendResponse({ success: false, error: error.message })
      })
    return true // 保持消息通道开启
  }

  // Handle prompt related messages
  if (message.type === 'getPrompts') {
    promptService
      .getPrompts()
      .then((prompts) => sendResponse({ success: true, data: prompts }))
      .catch((error) => sendResponse({ success: false, error: error.message }))
    return true
  }

  if (message.type === 'createPrompt') {
    promptService
      .createPrompt(message.data)
      .then((prompt) => sendResponse({ success: true, data: prompt }))
      .catch((error) => sendResponse({ success: false, error: error.message }))
    return true
  }

  if (message.type === 'updatePrompt') {
    promptService
      .updatePrompt(message.data)
      .then((prompt) => sendResponse({ success: true, data: prompt }))
      .catch((error) => sendResponse({ success: false, error: error.message }))
    return true
  }

  if (message.type === 'deletePrompt') {
    promptService
      .deletePrompt(message.data)
      .then(() => sendResponse({ success: true }))
      .catch((error) => sendResponse({ success: false, error: error.message }))
    return true
  }
})
