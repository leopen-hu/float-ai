import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Message, StreamMessage } from '../types/message'
import { MessageService } from '../services/messageService'
import MessageList from './MessageList'
import { Button } from '@/components/ui/button'
import { Send } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

const ChatManager = () => {
  const [messages, setMessages] = useState<Array<Message>>([])
  const [inputValue, setInputValue] = useState('')
  const [model, setModel] = useState('deepseek-chat')
  const [apiKey, setApiKey] = useState('')
  const [showApiKeyInput, setShowApiKeyInput] = useState(false)
  const [useStreamChat, setUseStreamChat] = useState(true)
  const { t } = useTranslation()

  useEffect(() => {
    chrome.storage.local.get(['apiKey', 'useStreamChat']).then((result) => {
      if (result.apiKey) {
        setApiKey(result.apiKey)
      }
      setUseStreamChat(result.useStreamChat ?? true)
    })
  }, [model])

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
    chrome.storage.local.get('apiKey').then((result) => {
      if (result.apiKey) {
        setApiKey(result.apiKey)
      }
    })

    const messageService = MessageService.getInstance()
    const handleStreamMessage = (message: StreamMessage) => {
      messageService.handleStreamMessage(message, model, setMessages)
    }

    chrome.runtime.onMessage.addListener(handleStreamMessage)
    return () => {
      chrome.runtime.onMessage.removeListener(handleStreamMessage)
    }
  }, [model])

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

  const handleModelChange = async (newModel: string) => {
    setModel(newModel)
    try {
      await chrome.storage.local.set({ model: newModel })
    } catch (error) {
      console.error('保存模型选择失败:', error)
      toast.error(t('保存模型选择失败，请重试'))
    }
  }

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      toast.error(t('API Key is required'))
      return
    }

    try {
      await chrome.storage.local.set({ apiKey })
      setShowApiKeyInput(false)
    } catch (error) {
      console.error('保存API密钥失败:', error)
      toast.error(t('An error occurred'))
    }
  }

  return (
    <div className="chat-container">
      <div className="settings-container">
        <div className="api-key-config">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowApiKeyInput(!showApiKeyInput)}
          >
            {showApiKeyInput ? t('Cancel') : t('API Key')}
          </Button>
          {showApiKeyInput && (
            <div className="api-key-input-container">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={t('Type your message here...')}
              />
              <Button variant="default" size="sm" onClick={handleSaveApiKey}>
                {t('Save')}
              </Button>
            </div>
          )}
        </div>
      </div>
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
            <Select value={model} onValueChange={handleModelChange}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="选择模型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="deepseek-chat">DeepSeek-V3</SelectItem>
                <SelectItem value="deepseek-reasoner">DeepSeek-R1</SelectItem>
              </SelectContent>
            </Select>
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
