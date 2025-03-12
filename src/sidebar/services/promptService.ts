import type { Prompt, PromptCreateInput, PromptUpdateInput } from '../types/prompt'

export type PromptResponse = {
  success: boolean
  data?: Prompt
  error?: string
}

export type PromptsResponse = {
  success: boolean
  data?: Prompt[]
  error?: string
}

export class PromptService {
  private static instance: PromptService

  private constructor() {}

  static getInstance(): PromptService {
    if (!PromptService.instance) {
      PromptService.instance = new PromptService()
    }
    return PromptService.instance
  }

  async getPrompts(): Promise<Prompt[]> {
    const response: PromptsResponse = await chrome.runtime.sendMessage({
      type: 'getPrompts'
    })
    return response.data || []
  }

  async createPrompt(input: PromptCreateInput): Promise<Prompt | undefined> {
    const response:PromptResponse = await chrome.runtime.sendMessage({
      type: 'createPrompt',
      data: input
    })
    if (!response.success) {
      throw new Error(response.error || '创建提示词失败')
    }
    return response.data
  }

  async updatePrompt(input: PromptUpdateInput): Promise<Prompt | undefined> {
    const response: PromptResponse = await chrome.runtime.sendMessage({
      type: 'updatePrompt',
      data: input
    })
    if (!response.success) {
      throw new Error(response.error || '更新提示词失败')
    }
    return response.data
  }

  async deletePrompt(id: string): Promise<boolean> {
    const response: PromptResponse = await chrome.runtime.sendMessage({
      type: 'deletePrompt',
      data: id
    })
    if (!response.success) {
      throw new Error(response.error || '删除提示词失败')
    }
    return true
  }
}

export const promptService = PromptService.getInstance()
