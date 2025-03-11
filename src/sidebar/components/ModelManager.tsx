import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'

interface Model {
  id: string
  name: string
  apiKey: string
  baseUrl?: string
}

const ModelManager = () => {
  const { t } = useTranslation()
  const [models, setModels] = useState<Model[]>([])
  const [newModel, setNewModel] = useState<Model>({
    id: '',
    name: '',
    apiKey: '',
    baseUrl: ''
  })


  useEffect(() => {
    const loadModels = async () => {
      try {
        const result = await chrome.storage.local.get('models')
        setModels(result.models || [])
      } catch (error) {
        console.error('加载模型列表失败:', error)
        toast.error(t('加载模型列表失败'), {
          description: error instanceof Error ? error.message : '未知错误'
        })
      }
    }
    loadModels()
  }, [t])



  const handleAddModel = async () => {
    if (!newModel.name || !newModel.apiKey) {
      toast.error(t('请填写模型名称和API密钥'), {
        description: t('这些字段是必需的')
      })
      return
    }

    const modelToAdd = {
      ...newModel,
      id: Date.now().toString()
    }

    try {
      const updatedModels = [...models, modelToAdd]
      await chrome.storage.local.set({ models: updatedModels })
      setModels(updatedModels)
      setNewModel({ id: '', name: '', apiKey: '', baseUrl: '' })
      toast.success(t('添加模型成功'), {
        description: t('新模型已添加到列表中')
      })
    } catch (error) {
      console.error('添加模型失败:', error)
      toast.error(t('添加模型失败'), {
        description: error instanceof Error ? error.message : '未知错误'
      })
    }
  }

  const handleDeleteModel = async (id: string) => {
    try {
      const updatedModels = models.filter(model => model.id !== id)
      await chrome.storage.local.set({ models: updatedModels })
      setModels(updatedModels)
      toast.success(t('删除模型成功'), {
        description: t('模型已从列表中移除')
      })
    } catch (error) {
      console.error('删除模型失败:', error)
      toast.error(t('删除模型失败'), {
        description: error instanceof Error ? error.message : '未知错误'
      })
    }
  }

  const handleUpdateModel = async (updatedModel: Model) => {
    try {
      const updatedModels = models.map(model =>
        model.id === updatedModel.id ? updatedModel : model
      )
      await chrome.storage.local.set({ models: updatedModels })
      setModels(updatedModels)
      toast.success(t('更新模型成功'), {
        description: t('模型信息已更新')
      })
    } catch (error) {
      console.error('更新模型失败:', error)
      toast.error(t('更新模型失败'), {
        description: error instanceof Error ? error.message : '未知错误'
      })
    }
  }

  return (
    <div className="model-manager">
      <div className="model-form">
        <input
          type="text"
          placeholder={t('模型名称')}
          value={newModel.name}
          onChange={e => setNewModel({ ...newModel, name: e.target.value })}
        />
        <input
          type="password"
          placeholder={t('API密钥')}
          value={newModel.apiKey}
          onChange={e => setNewModel({ ...newModel, apiKey: e.target.value })}
        />
        <input
          type="text"
          placeholder={t('基础URL（可选）')}
          value={newModel.baseUrl}
          onChange={e => setNewModel({ ...newModel, baseUrl: e.target.value })}
        />
        <button onClick={handleAddModel}>{t('添加模型')}</button>
      </div>

      <div className="model-list">
        {models.map(model => (
          <div key={model.id} className="model-item">
            <div className="model-info">
              <h3>{model.name}</h3>
              <p>{t('API密钥')}: ****{model.apiKey.slice(-4)}</p>
              {model.baseUrl && <p>{t('基础URL')}: {model.baseUrl}</p>}
            </div>
            <div className="model-actions">
              <button onClick={() => handleDeleteModel(model.id)}>{t('删除')}</button>
              <button
                onClick={() => handleUpdateModel({
                  ...model,
                  name: prompt(t('请输入新的模型名称'), model.name) || model.name,
                  apiKey: prompt(t('请输入新的API密钥'), model.apiKey) || model.apiKey,
                  baseUrl: prompt(t('请输入新的基础URL'), model.baseUrl) || model.baseUrl
                })}
              >
                {t('编辑')}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ModelManager
