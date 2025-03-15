import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { Prompt, PromptCreateInput } from '../types/prompt'
import { promptService } from '../services/promptService'
import { toast } from 'sonner'
import { Pencil, Trash2, Check, Copy } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface PromptManagerProps {
  onSelectPrompt?: (prompt: Prompt) => void
}

const PromptManager: React.FC<PromptManagerProps> = ({ onSelectPrompt }) => {
  const { t } = useTranslation()
  const handleCopyPrompt = (prompt: Prompt) => {
    setEditingPrompt({
      name: `${prompt.name} (复制)`,
      description: prompt.description || '',
      systemRole: prompt.systemRole || '',
      userRole: prompt.userRole || '',
    })
    setIsDialogOpen(true)
  }
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [deletePromptId, setDeletePromptId] = useState<string | null>(null)
  const [editingPrompt, setEditingPrompt] = useState<
    PromptCreateInput & { id?: string }
  >({
    name: '',
    description: '',
    systemRole: '',
    userRole: '',
  })

  useEffect(() => {
    const loadPrompts = async () => {
      try {
        const data = await promptService.getPrompts()
        setPrompts(data)
      } catch (error) {
        console.error('加载提示词失败:', error)
        toast.error(t('Failed to load prompts'))
      }
    }
    loadPrompts()
  }, [t])

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
          toast.success(t('Successfully updated prompt'))
        }
      } else {
        // 创建新提示词
        const newPrompt = await promptService.createPrompt(editingPrompt)
        if (newPrompt) {
          setPrompts([...prompts, { ...editingPrompt, ...newPrompt }])
          toast.success(t('Successfully created prompt'))
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
        editingPrompt.id
          ? t('Failed to update prompt')
          : t('Failed to create prompt'),
      )
    }
  }

  const handleDeletePrompt = async (id: string) => {
    setDeletePromptId(id)
  }

  const confirmDelete = async () => {
    if (!deletePromptId) return

    try {
      await promptService.deletePrompt(deletePromptId)
      setPrompts(prompts.filter((p) => p.id !== deletePromptId))
      toast.success(t('Successfully deleted prompt'))
    } catch (error) {
      console.error('删除提示词失败:', error)
      toast.error(t('Failed to delete prompt'))
    } finally {
      setDeletePromptId(null)
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
        <h2 className="text-lg font-semibold">{t('Prompt Management')}</h2>
        <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
          {t('Create Prompt')}
        </Button>
      </div>

      <AlertDialog
        open={!!deletePromptId}
        onOpenChange={(open) => !open && setDeletePromptId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('Confirm Delete')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t(
                'Are you sure to delete this prompt? This action cannot be undone.',
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('Cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              {t('Delete Prompt')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogDescription />
            <DialogTitle>
              {editingPrompt.id ? t('Edit Prompt') : t('Create Prompt')}
            </DialogTitle>
            <p
              id="prompt-form-description"
              className="text-sm text-muted-foreground"
            >
              {editingPrompt.id
                ? t('Modify existing prompt configuration')
                : t('Create new prompt configuration')}
            </p>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">{t('Prompt Name')}</Label>
              <Input
                id="name"
                value={editingPrompt.name}
                onChange={(e) =>
                  setEditingPrompt({ ...editingPrompt, name: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">{t('Description (Optional)')}</Label>
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
              <Label htmlFor="systemRole">{t('System Role (Optional)')}</Label>
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
              <Label htmlFor="userRole">{t('User Role (Optional)')}</Label>
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
              {t('Cancel')}
            </Button>
            <Button onClick={handleSavePrompt}>
              {editingPrompt.id ? t('Update') : t('Save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('Name')}</TableHead>
            <TableHead className="text-right">{t('Actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {prompts
            .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
            .map((prompt) => (
              <TableRow key={prompt.id}>
                <TableCell>{prompt.name}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeletePrompt(prompt.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditPrompt(prompt)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleCopyPrompt(prompt)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  {onSelectPrompt && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onSelectPrompt(prompt)}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
      <div
        className="flex justify-center mt-4 space-x-2"
        hidden={prompts.length <= itemsPerPage}
      >
        <Button
          variant="outline"
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1}
        >
          {t('Previous')}
        </Button>
        <Button
          variant="outline"
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={currentPage * itemsPerPage >= prompts.length}
        >
          {t('Next')}
        </Button>
      </div>
    </div>
  )
}

export default PromptManager
