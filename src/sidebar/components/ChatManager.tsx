import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Message, StreamMessage } from '../types/message'
import { MessageService } from '../services/messageService'
import MessageList from './MessageList'
import { Button } from '@/components/ui/button'
import { Send } from 'lucide-react'
import { toast } from 'sonner'
import ModelSelector from './ModelSelector'

const ChatManager = () => {
  const [messages, setMessages] = useState<Array<Message>>([])
  const [inputValue, setInputValue] = useState('')
  const { t } = useTranslation()

  useEffect(() => {
    const messageService = MessageService.getInstance()
    const handleStreamMessage = (message: StreamMessage) => {
      messageService.handleStreamMessage(message, setMessages)
    }

    chrome.runtime.onMessage.addListener(handleStreamMessage)
    return () => {
      chrome.runtime.onMessage.removeListener(handleStreamMessage)
    }
  }, [])

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    setMessages([
      ...messages,
      { content: inputValue, isUser: true, isReasoningCollapsed: false },
    ])
    setInputValue('')

    try {
      await MessageService.getInstance().sendMessage(inputValue)
    } catch (error) {
      console.error('发送消息失败:', error)
      toast.error(t('发送消息失败，请重试'))
    }
  }

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex-none p-4 border-b">
        <h1 className="text-xl font-semibold">{t('New Chat')}</h1>
      </div>
      <div className="flex-1 overflow-y-auto">
        <MessageList messages={messages} />
      </div>
      <div className="flex-none p-4 border-t">
        <div className="relative h-fit max-h-[250px] rounded-lg border bg-background shadow-sm">
          <div className="inset-0 min-h-[100px] pointer-events-none opacity-0 p-2 break-words whitespace-break-spaces">
            {inputValue + ' '}
          </div>
          <textarea
            className=" absolute bottom-0 left-0 right-0 top-0 p-2 break-words whitespace-break-spaces bg-transparent resize-none focus:outline-none"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyUp={(e) =>
              e.key === 'Enter' &&
              !e.shiftKey &&
              inputValue.trim() &&
              handleSendMessage()
            }
            placeholder={t('Type your message here...')}
          />
        </div>
        <div className="flex items-center justify-between mt-4 space-x-4">
          <div className="flex items-center space-x-4">
            <ModelSelector className="w-[150px]" />
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim()}
            className={`flex items-center space-x-2 ${!inputValue.trim() ? 'opacity-50' : ''}`}
          >
            <Send className="h-4 w-4" /> <span>{t('Send')}</span>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ChatManager
