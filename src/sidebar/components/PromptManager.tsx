import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { Prompt, PromptCreateInput } from '../types/prompt'
import { promptService } from '../services/promptService'
import { toast } from 'sonner'

interface PromptManagerProps {
  onSelectPrompt?: (prompt: Prompt) => void
}

const PromptManager: React.FC<PromptManagerProps> = ({ onSelectPrompt }) => {
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPrompt, setEditingPrompt] = useState<
    PromptCreateInput & { id?: string }
  >({
    name: '',
    description: '',
    systemRole: '',
    userRole: '',
  })

  useEffect(() => {
    loadPrompts()
  }, [])

  const loadPrompts = async () => {
    try {
      const data = await promptService.getPrompts()
      setPrompts(data)
    } catch (error) {
      console.error('加载提示词失败:', error)
      toast.error('加载提示词失败，请重试')
    }
  }

  const handleSavePrompt = async () => {
    try {
      if (editingPrompt.id) {
        // 更新现有提示词
        const updatedPrompt = await promptService.updatePrompt({
          ...editingPrompt,
          id: editingPrompt.id,
        })
        if (updatedPrompt) {
          setPrompts(
            prompts.map((p) => (p.id === updatedPrompt.id ? updatedPrompt : p)),
          )
          toast.success('更新提示词成功')
        }
      } else {
        // 创建新提示词
        const newPrompt = await promptService.createPrompt(editingPrompt)
        if (newPrompt) {
          setPrompts([...prompts, { ...editingPrompt, ...newPrompt }])
          toast.success('创建提示词成功')
        }
      }
      setIsDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error(
        editingPrompt.id ? '更新提示词失败:' : '创建提示词失败:',
        error,
      )
      toast.error(
        editingPrompt.id ? '更新提示词失败，请重试' : '创建提示词失败，请重试',
      )
    }
  }

  const handleDeletePrompt = async (id: string) => {
    try {
      await promptService.deletePrompt(id)
      setPrompts(prompts.filter((p) => p.id !== id))
      toast.success('删除提示词成功')
    } catch (error) {
      console.error('删除提示词失败:', error)
      toast.error('删除提示词失败，请重试')
    }
  }

  const handleEditPrompt = (prompt: Prompt) => {
    setEditingPrompt({
      id: prompt.id,
      name: prompt.name,
      description: prompt.description || '',
      systemRole: prompt.systemRole || '',
      userRole: prompt.userRole || '',
    })
    setIsDialogOpen(true)
  }

  const resetForm = () => {
    setEditingPrompt({
      name: '',
      description: '',
      systemRole: '',
      userRole: '',
    })
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">提示词管理</h2>
        <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
          新建提示词
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogDescription />
            <DialogTitle>
              {editingPrompt.id ? '编辑提示词' : '新建提示词'}
            </DialogTitle>
            <p
              id="prompt-form-description"
              className="text-sm text-muted-foreground"
            >
              {editingPrompt.id ? '修改现有提示词配置' : '创建新的提示词配置'}
            </p>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">提示词名称</Label>
              <Input
                id="name"
                value={editingPrompt.name}
                onChange={(e) =>
                  setEditingPrompt({ ...editingPrompt, name: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">描述（可选）</Label>
              <Input
                id="description"
                value={editingPrompt.description}
                onChange={(e) =>
                  setEditingPrompt({
                    ...editingPrompt,
                    description: e.target.value,
                  })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="systemRole">System Role（可选）</Label>
              <Textarea
                id="systemRole"
                value={editingPrompt.systemRole}
                onChange={(e) =>
                  setEditingPrompt({
                    ...editingPrompt,
                    systemRole: e.target.value,
                  })
                }
                className="h-24"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="userRole">User Role（可选）</Label>
              <Textarea
                id="userRole"
                value={editingPrompt.userRole}
                onChange={(e) =>
                  setEditingPrompt({
                    ...editingPrompt,
                    userRole: e.target.value,
                  })
                }
                className="h-24"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSavePrompt}>
              {editingPrompt.id ? '更新' : '保存'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="space-y-4">
        {prompts.map((prompt) => (
          <div
            key={prompt.id}
            className="p-4 border rounded-lg hover:bg-accent"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-medium">{prompt.name}</h3>
                {prompt.description && (
                  <p className="text-sm text-muted-foreground">
                    {prompt.description}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onSelectPrompt?.(prompt)}
                >
                  使用
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEditPrompt(prompt)}
                >
                  编辑
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeletePrompt(prompt.id)}
                >
                  删除
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default PromptManager
