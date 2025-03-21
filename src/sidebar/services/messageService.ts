import { StreamMessage } from '../types/message'

export interface Message {
  content: string
  isUser: boolean
  reasoningContent?: string | null
  isReasoningCollapsed: boolean
}

export type SendMessageResponse = {
  success: boolean
  data?: { content: string; reasoningContent: string }
  error?: string
}

export class MessageService {
  private static instance: MessageService
  private currentStreamMessage: string = ''
  private currentReasoningContent: string = ''
  private isGenerating: boolean = false

  private constructor() {}

  public static getInstance(): MessageService {
    if (!MessageService.instance) {
      MessageService.instance = new MessageService()
    }
    return MessageService.instance
  }

  public async sendMessage(content: string): Promise<void> {
    try {
      const response = await chrome.runtime.sendMessage<SendMessageResponse>({
        type: 'stream',
        content: content,
      })

      if (!response.success) {
        throw new Error(response.error || '未知错误')
      }
    } catch (error) {
      console.error('发送消息失败:', error)
      throw error
    }
  }

  public async sendNonStreamMessage(
    content: string,
  ): Promise<{ content: string; reasoningContent: string }> {
    try {
      const response = await chrome.runtime.sendMessage<SendMessageResponse>({
        type: 'not-stream',
        content: content,
      })
      if (!response.success) {
        throw new Error(response.error || '未知错误')
      }

      return response.data
        ? response.data
        : { content: '', reasoningContent: '' }
    } catch (error) {
      console.error('发送消息失败:', error)
      throw error
    }
  }

  public handleStreamMessage(
    message: StreamMessage,
    updateMessages: (updater: (prevMessages: Message[]) => Message[]) => void,
  ): void {
    if (message.type === 'chat-stream') {
      const { content, reasoning_content, done } = message.data
      if (done) {
        this.resetState()
      } else {
        this.handleStreamUpdate(content, reasoning_content, updateMessages)
      }
    }
  }

  private handleStreamUpdate(
    content: string,
    reasoningContent: string,
    updateMessages: (updater: (prevMessages: Message[]) => Message[]) => void,
  ): void {
    this.currentStreamMessage = content
    this.currentReasoningContent = reasoningContent

    updateMessages((prevMessages) => {
      const newMessages = [...prevMessages]
      const updatedMessage: Message = {
        content: this.currentStreamMessage,
        reasoningContent: this.currentReasoningContent,
        isUser: false,
        isReasoningCollapsed: false,
      }

      if (this.isGenerating) {
        newMessages[newMessages.length - 1] = updatedMessage
      } else {
        newMessages.push(updatedMessage)
        this.isGenerating = true
      }
      return newMessages
    })
  }

  private resetState(): void {
    this.currentStreamMessage = ''
    this.currentReasoningContent = ''
    this.isGenerating = false
  }
}
