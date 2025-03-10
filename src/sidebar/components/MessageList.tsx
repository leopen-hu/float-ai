import { Message } from '../types/message'
import MessageItem from './MessageItem'

interface MessageListProps {
  messages: Message[]
}

const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  return (
    <div className="messages-container">
      {messages.map((message, index) => (
        <MessageItem key={index} message={message} />
      ))}
    </div>
  )
}

export default MessageList
