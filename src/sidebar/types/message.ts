export interface Message {
  content: string
  isUser: boolean
  reasoningContent?: string | null
  isReasoningCollapsed: boolean
}

export type SendMessageResponse = {
  success: boolean
  data?: { message: string }
  error?: string
}

export interface StreamMessage {
  type: 'chat-stream'
  data: {
    content: string
    reasoning_content: string
    done: boolean
  }
}
