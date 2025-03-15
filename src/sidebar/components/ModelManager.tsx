import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { modelService } from '@/workjs/services/modelService'

interface Model {
  id: string
  name: string
  apiKey: string
  baseUrl?: string
  modelId?: string
}

interface ModelFormData {
  name: string
  apiKey: string
  baseUrl: string
  modelId: string
}

const ModelManager = () => {
  const { t } = useTranslation()
  const [models, setModels] = useState<Model[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingModel, setEditingModel] = useState<Model | null>(null)
  const [formData, setFormData] = useState<ModelFormData>({
    name: '',
    apiKey: '',
    baseUrl: '',
    modelId: '',
  })

  useEffect(() => {
    const loadModels = async () => {
      try {
        const models = await modelService.getModels()
        setModels(models)
      } catch (error) {
        console.error('加载模型列表失败:', error)
        toast.error(t('加载模型列表失败'), {
          description: error instanceof Error ? error.message : '未知错误',
        })
      }
    }
    loadModels()
  }, [t])

  const handleSaveModel = async () => {
    if (!formData.name || !formData.apiKey) {
      toast.error(t('请填写模型名称和API密钥'), {
        description: t('这些字段是必需的'),
      })
      return
    }

    try {
      if (editingModel) {
        // 更新现有模型
        const updatedModel = await modelService.updateModel({
          ...editingModel,
          ...formData,
        })
        setModels(
          models.map((model) =>
            model.id === updatedModel.id ? updatedModel : model,
          ),
        )
      } else {
        // 添加新模型
        const newModel = await modelService.createModel(formData)
        setModels([...models, newModel])
      }
      setIsDialogOpen(false)
      resetForm()

      toast.success(editingModel ? t('更新模型成功') : t('添加模型成功'), {
        description: editingModel
          ? t('模型信息已更新')
          : t('新模型已添加到列表中'),
      })
    } catch (error) {
      console.error(editingModel ? '更新模型失败:' : '添加模型失败:', error)
      toast.error(editingModel ? t('更新模型失败') : t('添加模型失败'), {
        description: error instanceof Error ? error.message : '未知错误',
      })
    }
  }

  const handleDeleteModel = async (id: string) => {
    try {
      await modelService.deleteModel(id)
      setModels(models.filter((model) => model.id !== id))
      toast.success(t('删除模型成功'), {
        description: t('模型已从列表中移除'),
      })
    } catch (error) {
      console.error('删除模型失败:', error)
      toast.error(t('删除模型失败'), {
        description: error instanceof Error ? error.message : '未知错误',
      })
    }
  }

  const handleEditModel = (model: Model) => {
    setEditingModel(model)
    setFormData({
      name: model.name,
      apiKey: model.apiKey,
      baseUrl: model.baseUrl || '',
      modelId: model.modelId || '',
    })
    setIsDialogOpen(true)
  }

  const handleCopyModel = (model: Model) => {
    setFormData({
      name: `${model.name} (${t('复制')})`,
      apiKey: model.apiKey,
      baseUrl: model.baseUrl || '',
      modelId: model.modelId || '',
    })
    setIsDialogOpen(true)
  }

  const resetForm = () => {
    setEditingModel(null)
    setFormData({
      name: '',
      apiKey: '',
      baseUrl: '',
      modelId: '',
    })
  }

  return (
    <div className="model-manager">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">{t('模型管理')}</h2>
        <Button onClick={() => setIsDialogOpen(true)}>{t('添加模型')}</Button>
      </div>

      <div className="model-list">
        {models.map((model) => (
          <div key={model.id} className="model-item">
            <div className="model-info">
              <h3>{model.name}</h3>
              <p>
                {t('API密钥')}: ****{model.apiKey.slice(-4)}
              </p>
              {model.baseUrl && (
                <p>
                  {t('基础URL')}: {model.baseUrl}
                </p>
              )}
              {model.modelId && (
                <p>
                  {t('模型ID')}: {model.modelId}
                </p>
              )}
            </div>
            <div className="model-actions">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDeleteModel(model.id)}
              >
                {t('删除')}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleCopyModel(model)}
              >
                {t('复制')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEditModel(model)}
              >
                {t('编辑')}
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogDescription />
            <DialogTitle>
              {editingModel ? t('编辑模型') : t('添加模型')}
            </DialogTitle>
            <p
              id="model-form-description"
              className="text-sm text-muted-foreground"
            >
              {editingModel ? t('修改模型配置信息') : t('添加新的模型配置')}
            </p>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">{t('模型名称')}</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="apiKey">{t('API密钥')}</Label>
              <Input
                id="apiKey"
                type="password"
                value={formData.apiKey}
                onChange={(e) =>
                  setFormData({ ...formData, apiKey: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="modelId">{t('模型ID')}</Label>
              <Input
                id="modelId"
                value={formData.modelId}
                onChange={(e) =>
                  setFormData({ ...formData, modelId: e.target.value })
                }
                placeholder="gpt-3.5-turbo"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="baseUrl">{t('基础URL（可选）')}</Label>
              <Input
                id="baseUrl"
                value={formData.baseUrl}
                onChange={(e) =>
                  setFormData({ ...formData, baseUrl: e.target.value })
                }
                placeholder="https://api.openai.com/v1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              {t('取消')}
            </Button>
            <Button onClick={handleSaveModel}>
              {editingModel ? t('更新') : t('添加')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ModelManager
