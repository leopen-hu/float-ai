import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/prompts')({
  component: Prompts,
})

function Prompts() {
  return <div>prompts</div>
}
