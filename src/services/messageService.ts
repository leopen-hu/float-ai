import { StreamMessage } from '../types/message';

export interface Message {
  content: string;
  isUser: boolean;
  reasoningContent?: string | null;
  isReasoningCollapsed: boolean;
}

export type SendMessageResponse = {
  success: boolean;
  data?: { message: string };
  error?: string;
}

export class MessageService {
  private static instance: MessageService;
  private currentStreamMessage: string = '';
  private currentReasoningContent: string = '';
  private isGenerating: boolean = false;

  private constructor() {}

  public static getInstance(): MessageService {
    if (!MessageService.instance) {
      MessageService.instance = new MessageService();
    }
    return MessageService.instance;
  }

  public async sendMessage(content: string): Promise<void> {
    try {
      const response = await chrome.runtime.sendMessage<SendMessageResponse>({
        type: 'chat',
        content: content
      });

      if (!response.success) {
        throw new Error(response.error || '未知错误');
      }
    } catch (error) {
      console.error('发送消息失败:', error);
      throw error;
    }
  }

  public handleStreamMessage(
    message: StreamMessage,
    model: string,
    updateMessages: (updater: (prevMessages: Message[]) => Message[]) => void
  ): void {
    if (message.type === 'chat-stream') {
      const { content, reasoning_content, done } = message.data;
      if (done) {
        this.handleStreamComplete(updateMessages);
      } else {
        this.handleStreamUpdate(content, reasoning_content, model, updateMessages);
      }
    }
  }

  private handleStreamComplete(
    updateMessages: (updater: (prevMessages: Message[]) => Message[]) => void
  ): void {
    updateMessages(prevMessages => {
      const newMessages = [...prevMessages];
      if (this.isGenerating) {
        newMessages.pop();
      }
      const newMessage: Message = {
        content: this.currentStreamMessage,
        reasoningContent: this.currentReasoningContent || null,
        isReasoningCollapsed: false,
        isUser: false
      };
      return [...newMessages, newMessage];
    });
    this.resetState();
  }

  private handleStreamUpdate(
    content: string,
    reasoningContent: string,
    model: string,
    updateMessages: (updater: (prevMessages: Message[]) => Message[]) => void
  ): void {
    this.currentStreamMessage += content;
    if (model === 'deepseek-reasoner') {
      this.currentReasoningContent = reasoningContent;
    }

    updateMessages(prevMessages => {
      const newMessages = [...prevMessages];
      const updatedMessage: Message = {
        content: this.currentStreamMessage,
        reasoningContent: model === 'deepseek-reasoner' ? this.currentReasoningContent : null,
        isUser: false,
        isReasoningCollapsed: false
      };

      if (this.isGenerating) {
        newMessages[newMessages.length - 1] = updatedMessage;
      } else {
        newMessages.push(updatedMessage);
        this.isGenerating = true;
      }
      return newMessages;
    });
  }

  private resetState(): void {
    this.currentStreamMessage = '';
    this.currentReasoningContent = '';
    this.isGenerating = false;
  }
}
