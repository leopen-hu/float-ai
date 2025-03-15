export interface Prompt {
  id: string
  name: string
  description?: string
  systemRole?: string
  userRole?: string
  createdAt: number
  updatedAt: number
}

export interface PromptCreateInput {
  name: string
  description?: string
  systemRole?: string
  userRole?: string
}

export interface PromptUpdateInput extends Partial<PromptCreateInput> {
  id: string
}
