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
  const [useStreamChat, setUseStreamChat] = useState(true)
  const { t } = useTranslation()

  useEffect(() => {
    chrome.storage.local.get(['apiKey', 'useStreamChat']).then((result) => {
      setUseStreamChat(result.useStreamChat ?? true)
    })
  }, [])

  const handleStreamChatChange = async (checked: boolean) => {
    setUseStreamChat(checked)
    try {
      await chrome.storage.local.set({ useStreamChat: checked })
    } catch (error) {
      console.error('保存流式对话设置失败:', error)
      toast.error(t('保存设置失败，请重试'))
    }
  }

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
      if (useStreamChat) {
        await MessageService.getInstance().sendMessage(inputValue)
      } else {
        const response =
          await MessageService.getInstance().sendNonStreamMessage(inputValue)
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            content: response.content,
            reasoningContent: response.reasoningContent,
            isUser: false,
            isReasoningCollapsed: false,
          },
        ])
      }
    } catch (error) {
      console.error('发送消息失败:', error)
      toast.error(t('发送消息失败，请重试'))
    }
  }

  return (
    <div className="chat-container">
      <div className="settings-container"></div>
      <MessageList messages={messages} />
      <div className="input-container">
        <div className="input-wrapper">
          <div className="input-mirror">{inputValue + ' '}</div>
          <textarea
            className="inputArea"
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
        <div className="input-controls">
          <div className="model-selector">
            <ModelSelector className="w-[150px]" />
            <div className="stream-chat-toggle">
              <input
                type="checkbox"
                id="streamChat"
                checked={useStreamChat}
                onChange={(e) => handleStreamChatChange(e.target.checked)}
              />
              <label htmlFor="streamChat">{t('流式对话')}</label>
            </div>
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim()}
            className={!inputValue.trim() ? 'button-disabled' : ''}
          >
            <Send /> {t('Send')}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ChatManager
