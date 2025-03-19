import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/chats')({
  component: Chats,
})

function Chats() {
  console.log('Chats')
  return <div>Chats</div>
}
