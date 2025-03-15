import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { modelService } from '@/workjs/services/modelService'

interface Model {
  id: string
  name: string
  apiKey: string
  baseUrl?: string
  modelId?: string
}

interface ModelSelectorProps {
  onModelChange?: (modelId: string) => void
  className?: string
}

const ModelSelector = ({ onModelChange, className }: ModelSelectorProps) => {
  const { t } = useTranslation()
  const [models, setModels] = useState<Model[]>([])
  const [selectedModel, setSelectedModel] = useState<string>('')

  useEffect(() => {
    const loadModels = async () => {
      try {
        const modelList = await modelService.getModels()
        setModels(modelList)

        // 从localStorage获取上次选择的模型
        const storedModel = await chrome.storage.local.get('model')
        if (storedModel.model && modelList.some(m => m.id === storedModel.model)) {
          setSelectedModel(storedModel.model)
          onModelChange?.(storedModel.model)
        } else if (modelList.length > 0) {
          // 如果没有存储的模型或存储的模型不在列表中，使用第一个模型
          setSelectedModel(modelList[0].id)
          onModelChange?.(modelList[0].id)
          await chrome.storage.local.set({ model: modelList[0].id })
        }
      } catch (error) {
        console.error('加载模型列表失败:', error)
        toast.error(t('Failed to load models'))
      }
    }
    loadModels()
  }, [onModelChange, t])

  const handleModelChange = async (modelId: string) => {
    setSelectedModel(modelId)
    onModelChange?.(modelId)
    try {
      await chrome.storage.local.set({ model: modelId })
    } catch (error) {
      console.error('保存模型选择失败:', error)
      toast.error(t('Failed to save model selection'))
    }
  }

  return (
    <Select value={selectedModel} onValueChange={handleModelChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={t('Select Model')} />
      </SelectTrigger>
      <SelectContent>
        {models.map((model) => (
          <SelectItem key={model.id} value={model.id}>
            {model.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export default ModelSelector
