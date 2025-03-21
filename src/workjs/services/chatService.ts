import { v4 as uuidv4 } from 'uuid'
import { dbService } from './dbService'

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
  reasoning_content?: string
}

export interface ChatSession {
  id: string
  title: string
  modelId: string
  createdAt: number
  updatedAt: number
  messages: ChatMessage[]
}

// 扩展数据库Schema
declare module './dbService' {
  interface FloatAIDB {
    chats: {
      key: string
      value: ChatSession
    }
  }
}

class ChatService {
  private static instance: ChatService

  private constructor() {}

  public static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService()
    }
    return ChatService.instance
  }

  public generateChatSessionTitle(messages: ChatMessage[]): string {
    if (messages.length === 0) {
      return 'New Chat'
    }
    const lastMessage = messages[messages.length - 1]
    if (lastMessage.role === 'user') {
      return lastMessage.content.substring(0, 20)
    }
    return 'New Chat'
  }

  public async saveChatSession(
    modelId: string,
    messages: ChatMessage[],
  ): Promise<string> {
    const db = await dbService.getDB()
    const chatSession: ChatSession = {
      id: uuidv4(),
      modelId,
      title: this.generateChatSessionTitle(messages),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages,
    }

    await db.put('chats', chatSession)
    return chatSession.id
  }

  public async getChatSession(id: string): Promise<ChatSession | undefined> {
    const db = await dbService.getDB()
    return await db.get('chats', id)
  }

  public async getAllChatSessions(): Promise<ChatSession[]> {
    const db = await dbService.getDB()
    return await db.getAll('chats')
  }

  public async updateChatSession(
    id: string,
    messages: ChatMessage[],
  ): Promise<void> {
    const db = await dbService.getDB()
    const chatSession = await this.getChatSession(id)
    if (chatSession) {
      chatSession.messages = messages
      chatSession.updatedAt = Date.now()
      await db.put('chats', chatSession)
    }
  }

  public async deleteChatSession(id: string): Promise<void> {
    const db = await dbService.getDB()
    await db.delete('chats', id)
  }
}

export const chatService = ChatService.getInstance()
