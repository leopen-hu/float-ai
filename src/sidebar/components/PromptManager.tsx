import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import type { Prompt, PromptCreateInput } from '../types/prompt'
import { promptService } from '../services/promptService'
import { toast } from 'sonner'

interface PromptManagerProps {
  onSelectPrompt?: (prompt: Prompt) => void
}

const PromptManager: React.FC<PromptManagerProps> = ({ onSelectPrompt }) => {
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [editingPrompt, setEditingPrompt] = useState<PromptCreateInput>({
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

  const handleCreatePrompt = async () => {
    try {
      const newPrompt = await promptService.createPrompt(editingPrompt)
      if (newPrompt) {
        setPrompts([...prompts, { ...editingPrompt, ...newPrompt }])
        setIsEditing(false)
        setEditingPrompt({
          name: '',
          description: '',
          systemRole: '',
          userRole: '',
        })
        toast.success('创建提示词成功')
      }
    } catch (error) {
      console.error('创建提示词失败:', error)
      toast.error('创建提示词失败，请重试')
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

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">提示词管理</h2>
        <Button
          variant="outline"
          onClick={() => setIsEditing(true)}
          className="mb-4"
        >
          新建提示词
        </Button>
      </div>

      {isEditing && (
        <div className="mb-4 p-4 border rounded-lg">
          <input
            type="text"
            placeholder="提示词名称"
            value={editingPrompt.name}
            onChange={(e) =>
              setEditingPrompt({ ...editingPrompt, name: e.target.value })
            }
            className="w-full mb-2 p-2 border rounded"
          />
          <input
            type="text"
            placeholder="描述（可选）"
            value={editingPrompt.description}
            onChange={(e) =>
              setEditingPrompt({
                ...editingPrompt,
                description: e.target.value,
              })
            }
            className="w-full mb-2 p-2 border rounded"
          />
          <textarea
            placeholder="System Role（可选）"
            value={editingPrompt.systemRole}
            onChange={(e) =>
              setEditingPrompt({ ...editingPrompt, systemRole: e.target.value })
            }
            className="w-full mb-2 p-2 border rounded h-24"
          />
          <textarea
            placeholder="User Role（可选）"
            value={editingPrompt.userRole}
            onChange={(e) =>
              setEditingPrompt({ ...editingPrompt, userRole: e.target.value })
            }
            className="w-full mb-2 p-2 border rounded h-24"
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              取消
            </Button>
            <Button onClick={handleCreatePrompt}>保存</Button>
          </div>
        </div>
      )}

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
