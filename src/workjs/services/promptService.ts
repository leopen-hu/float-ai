import type { Prompt, PromptCreateInput, PromptUpdateInput } from '../../sidebar/types/prompt'

const DB_NAME = 'float-ai'
const STORE_NAME = 'prompts'

export class PromptService {
  private static instance: PromptService
  private db: IDBDatabase | null = null

  private constructor() {
    // 确保在实例创建时就开始初始化数据库
    this.initDB().catch(error => {
      console.error('数据库初始化失败:', error)
    })
  }

  static getInstance(): PromptService {
    if (!PromptService.instance) {
      PromptService.instance = new PromptService()
    }
    return PromptService.instance
  }

  private async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1)

      request.onerror = () => {
        reject(new Error('无法打开数据库'))
      }

      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' })
        }
      }
    })
  }

  private async getStore(mode: IDBTransactionMode = 'readonly'): Promise<IDBObjectStore> {
    // 如果数据库未初始化，等待初始化完成
    if (!this.db) {
      try {
        await this.initDB()
      } catch (error) {
        throw new Error('数据库初始化失败: ' + (error as Error).message)
      }
    }
    if (!this.db) {
      throw new Error('数据库未初始化')
    }
    const transaction = this.db.transaction(STORE_NAME, mode)
    return transaction.objectStore(STORE_NAME)
  }

  async getPrompts(): Promise<Prompt[]> {
      try {
        const store = await this.getStore()
        return new Promise<Prompt[]>((resolve, reject) => {
          const request = store.getAll()
          request.onsuccess = () => {
            resolve(request.result as Prompt[])
          }
          request.onerror = () => {
            reject(new Error('获取提示词失败'))
          }
        })
      } catch (error) {
        throw new Error('getPrompts失败: ' + (error as Error).message)
      }
    }
  async createPrompt(input: PromptCreateInput): Promise<IDBValidKey> {
    try {
      const store = await this.getStore('readwrite')
      const newPrompt: Prompt = {
        id: Date.now().toString(),
        ...input,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }
      const request = store.add(newPrompt)

      return new Promise((resolve, reject) => {
        request.onsuccess = () => {
          resolve(request.result)
        }
        request.onerror = () => {
          reject(new Error('创建提示词失败'))
        }
      })
    } catch (error) {
        throw new Error('createPrompt失败:'+ (error as Error).message)
      }
    }
  
  async updatePrompt(input: PromptUpdateInput): Promise<IDBValidKey> {
      try {
        const store = await this.getStore('readwrite')
        const updateRequest = store.put(input)
        return new Promise((resolve, reject) => {
          updateRequest.onsuccess = () => {
            resolve(updateRequest.result)
          }
          updateRequest.onerror = () => {
            reject(new Error('更新提示词失败'))
          }
        })
      } catch (error) {
        throw new Error('updatePrompt失败:'+ (error as Error).message)
      }
    }

  async deletePrompt(id: string): Promise<boolean> {
      try {
        const store = await this.getStore('readwrite')
        const request = store.delete(id)

        return new Promise((resolve, reject) => {
          request.onsuccess = () => {
            resolve(true)
          }
          request.onerror = () => {
            reject(new Error('删除提示词失败'))
          }
        })
      } catch (error) {
        throw new Error('deletePrompt失败:'+ (error as Error).message)
      }
    }
  }

export const promptService = PromptService.getInstance()
