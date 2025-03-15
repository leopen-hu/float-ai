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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Pencil, Trash2, Copy } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [deleteModelId, setDeleteModelId] = useState<string | null>(null)
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
        toast.error(t('Failed to load models'), {
          description:
            error instanceof Error ? error.message : t('Unknown error'),
        })
      }
    }
    loadModels()
  }, [t])

  const handleSaveModel = async () => {
    if (!formData.name || !formData.apiKey) {
      toast.error(t('Please fill in the model name and API key'), {
        description: t('These fields are required'),
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

      toast.success(
        editingModel
          ? t('Successfully updated model')
          : t('Successfully created model'),
        {
          description: editingModel
            ? t('Model information has been updated')
            : t('New model has been added to the list'),
        },
      )
    } catch (error) {
      console.error(editingModel ? '更新模型失败:' : '添加模型失败:', error)
      toast.error(
        editingModel
          ? t('Failed to update model')
          : t('Failed to create model'),
        {
          description:
            error instanceof Error ? error.message : t('Unknown error'),
        },
      )
    }
  }

  const handleDeleteModel = async (id: string) => {
    setDeleteModelId(id)
  }

  const confirmDelete = async () => {
    if (!deleteModelId) return

    try {
      await modelService.deleteModel(deleteModelId)
      setModels(models.filter((model) => model.id !== deleteModelId))
      toast.success(t('Successfully deleted model'), {
        description: t('Model has been removed from the list'),
      })
    } catch (error) {
      console.error('删除模型失败:', error)
      toast.error(t('Failed to delete model'), {
        description:
          error instanceof Error ? error.message : t('Unknown error'),
      })
    } finally {
      setDeleteModelId(null)
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
      name: `${model.name} (${t('Copy')})`,
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
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">{t('Model Management')}</h2>
        <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
          {t('Add Model')}
        </Button>
      </div>

      <AlertDialog
        open={!!deleteModelId}
        onOpenChange={(open) => !open && setDeleteModelId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('Confirm Delete')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t(
                'Are you sure to delete this model? This action cannot be undone.',
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('Cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              {t('Delete Model')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('名称')}</TableHead>
            <TableHead>{t('模型ID')}</TableHead>
            <TableHead className="text-right">{t('操作')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {models
            .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
            .map((model) => (
              <TableRow key={model.id}>
                <TableCell>{model.name}</TableCell>
                <TableCell>{model.modelId || '-'}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteModel(model.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditModel(model)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleCopyModel(model)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
      <div
        className="flex justify-center mt-4 space-x-2"
        hidden={models.length <= itemsPerPage}
      >
        <Button
          variant="outline"
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1}
        >
          {t('上一页')}
        </Button>
        <Button
          variant="outline"
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={currentPage * itemsPerPage >= models.length}
        >
          {t('下一页')}
        </Button>
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
