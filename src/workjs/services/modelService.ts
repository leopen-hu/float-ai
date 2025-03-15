import { dbService, Model } from './dbService'

class ModelService {
  private static instance: ModelService
  private constructor() {}

  public static getInstance(): ModelService {
    if (!ModelService.instance) {
      ModelService.instance = new ModelService()
    }
    return ModelService.instance
  }

  private async getDB() {
    return await dbService.getDB()
  }

  public async getModel(id: string): Promise<Model | undefined> {
    console.log('id', id)
    try {
      const db = await this.getDB()
      return await db.get('models', id)
    } catch (error) {
      console.error('获取模型失败:', error)
      throw error
    }
  }

  public async getModels(): Promise<Model[]> {
    try {
      const db = await this.getDB()
      return await db.getAll('models')
    } catch (error) {
      console.error('获取模型列表失败:', error)
      throw error
    }
  }

  public async createModel(model: Omit<Model, 'id'>): Promise<Model> {
    try {
      const db = await this.getDB()
      const newModel = {
        ...model,
        id: Date.now().toString(),
      }
      await db.add('models', newModel)
      return newModel
    } catch (error) {
      console.error('创建模型失败:', error)
      throw error
    }
  }

  public async updateModel(model: Model): Promise<Model> {
    try {
      const db = await this.getDB()
      await db.put('models', model)
      return model
    } catch (error) {
      console.error('更新模型失败:', error)
      throw error
    }
  }

  public async deleteModel(id: string): Promise<void> {
    try {
      const db = await this.getDB()
      await db.delete('models', id)
    } catch (error) {
      console.error('删除模型失败:', error)
      throw error
    }
  }
}

export const modelService = ModelService.getInstance()
