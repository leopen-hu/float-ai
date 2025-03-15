import { openDB, DBSchema, IDBPDatabase } from 'idb'

interface FloatAIDB extends DBSchema {
  models: {
    key: string
    value: Model
  }
  prompts: {
    key: string
    value: Prompt
  }
}

export interface Model {
  id: string
  name: string
  apiKey: string
  baseUrl: string
  modelId: string
}

export interface Prompt {
  id: string
  name: string
  description?: string
  systemRole?: string
  userRole?: string
  createdAt: number
  updatedAt: number
}

class DBService {
  private static instance: DBService
  private dbName = 'float-ai-db'
  private dbVersion = 2
  private db: Promise<IDBPDatabase<FloatAIDB>> | null = null

  private constructor() {
    // 在构造函数中初始化数据库连接
    this.initDB()
  }

  private async initDB() {
    if (!this.db) {
      this.db = openDB<FloatAIDB>(this.dbName, this.dbVersion, {
        upgrade(db) {
          if (!db.objectStoreNames.contains('models')) {
            db.createObjectStore('models', { keyPath: 'id' })
          }
          if (!db.objectStoreNames.contains('prompts')) {
            db.createObjectStore('prompts', { keyPath: 'id' })
          }
        },
      })
    }
  }

  public static getInstance(): DBService {
    if (!DBService.instance) {
      DBService.instance = new DBService()
    }
    return DBService.instance
  }

  public async getDB(): Promise<IDBPDatabase<FloatAIDB>> {
    if (!this.db) {
      await this.initDB()
    }
    return this.db as Promise<IDBPDatabase<FloatAIDB>>
  }
}

export const dbService = DBService.getInstance()
