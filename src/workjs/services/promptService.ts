import { dbService, Prompt } from './dbService'

interface PromptCreateInput {
  name: string
  description?: string
  systemRole?: string
  userRole?: string
}

class PromptService {
  private static instance: PromptService
  private constructor() {}

  public static getInstance(): PromptService {
    if (!PromptService.instance) {
      PromptService.instance = new PromptService()
    }
    return PromptService.instance
  }

  private async getDB() {
    return await dbService.getDB()
  }

  public async getPrompts(): Promise<Prompt[]> {
    try {
      const db = await this.getDB()
      const prompts = await db.getAll('prompts')
      return prompts
    } catch (error) {
      console.error('PromptService: 获取提示词列表失败:', error)
      throw error
    }
  }

  public async createPrompt(prompt: PromptCreateInput): Promise<Prompt> {
    try {
      const db = await this.getDB()
      const newPrompt = {
        ...prompt,
        id: Date.now().toString(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }
      await db.add('prompts', newPrompt)
      return newPrompt
    } catch (error) {
      console.error('PromptService: 创建提示词失败:', error)
      throw error
    }
  }

  public async updatePrompt(prompt: Prompt): Promise<Prompt> {
    try {
      const db = await this.getDB()
      const updatedPrompt = {
        ...prompt,
        updatedAt: Date.now(),
      }
      await db.put('prompts', updatedPrompt)
      return updatedPrompt
    } catch (error) {
      console.error('更新提示词失败:', error)
      throw error
    }
  }

  public async deletePrompt(id: string): Promise<void> {
    try {
      const db = await this.getDB()
      await db.delete('prompts', id)
    } catch (error) {
      console.error('PromptService: 删除提示词失败:', error)
      throw error
    }
  }
}

export const promptService = PromptService.getInstance()
