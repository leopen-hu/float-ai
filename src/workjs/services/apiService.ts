import { OpenAI } from 'openai'
import { modelService } from './modelService'

export interface ExtendedDelta extends OpenAI.ChatCompletionChunk.Choice.Delta {
  reasoning_content?: string
}

export interface ExtendedMessage extends OpenAI.Chat.ChatCompletionMessage {
  reasoning_content?: string
}

export interface CurrentModel extends OpenAI {
  modelId: string
}

export class ApiService {
  private static instance: ApiService

  private constructor() {}

  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService()
    }
    return ApiService.instance
  }

  private async initCurrentModel(): Promise<CurrentModel> {
    const { model: modelKey }: { model: string } =
      await chrome.storage.local.get('model')
    console.log('currentModelKey', modelKey)
    if (!modelKey) {
      throw new Error('未找到当前模型')
    }

    const currentModel = await modelService.getModel(modelKey)
    if (!currentModel) {
      throw new Error('模型在数据库中未找到')
    }

    return {
      ...new OpenAI({
        baseURL: currentModel.baseUrl,
        apiKey: currentModel.apiKey,
      }),
      modelId: currentModel.modelId,
    } as CurrentModel
  }

  private async getCurrentModel(): Promise<CurrentModel> {
    // 实时获取当前模型，以避免配置变更后不生效
    return await this.initCurrentModel()
  }

  public async streamChatCompletion(content: string): Promise<void> {
    try {
      const currentModel = await this.getCurrentModel()
      const { modelId = 'deepseek-chat' } = currentModel
      const completion = await currentModel.chat.completions.create({
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: content },
        ],
        model: modelId,
        stream: true,
      })

      let reasoningContent = ''

      for await (const chunk of completion) {
        const content =
          (chunk.choices[0]?.delta as ExtendedDelta)?.content || ''
        const reasoning =
          (chunk.choices[0]?.delta as ExtendedDelta)?.reasoning_content || ''
        reasoningContent += reasoning

        console.log('content', content)
        console.log('reasoningContent', reasoningContent)
        await this.sendStreamMessage(content, reasoningContent, false)
      }

      await this.sendStreamMessage('', '', true)
    } catch (error) {
      console.error('处理聊天消息时出错:', error)
      throw error
    }
  }

  public async chatCompletion(
    content: string,
  ): Promise<{ content: string; reasoningContent: string }> {
    try {
      const currentModel = await this.getCurrentModel()
      const { modelId } = currentModel
      const completion = await currentModel.chat.completions.create({
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: content },
        ],
        model: modelId,
        stream: false,
      })

      const responseContent = completion.choices[0]?.message?.content || ''
      const reasoningContent =
        (completion.choices[0]?.message as ExtendedMessage)
          ?.reasoning_content || ''

      return { content: responseContent, reasoningContent }
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
