import { OpenAI } from 'openai'

export interface ExtendedDelta extends OpenAI.ChatCompletionChunk.Choice.Delta {
  reasoning_content?: string
}

export class ApiService {
  private static instance: ApiService
  private openai: OpenAI | null = null

  private constructor() {}

  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService()
    }
    return ApiService.instance
  }

  private async initializeOpenAI(): Promise<OpenAI> {
    const { apiKey } = await chrome.storage.local.get('apiKey')

    if (!apiKey) {
      throw new Error('请先配置API密钥')
    }

    return new OpenAI({
      baseURL: 'https://api.deepseek.com',
      apiKey: apiKey,
    })
  }

  private async getOpenAIInstance(): Promise<OpenAI> {
    if (!this.openai) {
      this.openai = await this.initializeOpenAI()
    }
    return this.openai
  }

  public async streamChatCompletion(content: string): Promise<void> {
    try {
      const openai = await this.getOpenAIInstance()
      const { model = 'deepseek-chat' } =
        await chrome.storage.local.get('model')

      const completion = await openai.chat.completions.create({
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: content },
        ],
        model: model,
        stream: true,
      })

      let reasoningContent = ''

      for await (const chunk of completion) {
        const content =
          (chunk.choices[0]?.delta as ExtendedDelta)?.content || ''
        const reasoning =
          (chunk.choices[0]?.delta as ExtendedDelta)?.reasoning_content || ''
        reasoningContent += reasoning

        await this.sendStreamMessage(content, reasoningContent, false)
      }

      await this.sendStreamMessage('', '', true)
    } catch (error) {
      console.error('处理聊天消息时出错:', error)
      throw error
    }
  }

  private async sendStreamMessage(
    content: string,
    reasoningContent: string,
    done: boolean,
  ): Promise<void> {
    await chrome.runtime.sendMessage({
      type: 'chat-stream',
      data: {
        content,
        reasoning_content: reasoningContent,
        done,
      },
    })
  }
}
