import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/models')({
  component: Models,
})

function Models() {
  return <div>models</div>
}
