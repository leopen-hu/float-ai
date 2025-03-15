import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { MessageSquare, Bot, Settings, FileText } from 'lucide-react'
import ModelManager from './ModelManager'
import PromptManager from './PromptManager'
import BottomControl from './BottomControl'

interface SidebarProps {
  children: React.ReactNode
}

const Sidebar: React.FC<SidebarProps> = ({ children }) => {
  const { t } = useTranslation()
  const [activeMenu, setActiveMenu] = useState('chat')
  const sidebarRef = useRef<HTMLDivElement>(null)

  const renderContent = () => {
    switch (activeMenu) {
      case 'models':
        return <ModelManager />
      case 'prompts':
        return <PromptManager />
      case 'settings':
        return <div>设置页面</div>
      default:
        return children
    }
  }

  return (
    <div
      className="flex h-screen relative bg-white border-l border-gray-200"
      ref={sidebarRef}
    >
      <div className="flex flex-col justify-between bg-gray-100 border-r border-gray-200 pb-4">
        <div className="flex flex-col">
          <div
            className={`flex flex-col items-center p-3 cursor-pointer transition-colors duration-300 border-b border-gray-200 w-[80px] ${activeMenu === 'chat' ? 'bg-gray-200' : 'hover:bg-gray-200'}`}
            onClick={() => setActiveMenu('chat')}
          >
            <MessageSquare className="w-6 h-6 mb-1" />
            <span className="text-xs text-gray-600 truncate w-full text-center">
              {t('Chat')}
            </span>
          </div>
          <div
            className={`flex flex-col items-center p-3 cursor-pointer transition-colors duration-300 border-b border-gray-200 w-[80px] ${activeMenu === 'models' ? 'bg-gray-200' : 'hover:bg-gray-200'}`}
            onClick={() => setActiveMenu('models')}
          >
            <Bot className="w-6 h-6 mb-1" />
            <span className="text-xs text-gray-600 truncate w-full text-center">
              {t('Models')}
            </span>
          </div>
          <div
            className={`flex flex-col items-center p-3 cursor-pointer transition-colors duration-300 border-b border-gray-200 w-[80px] ${activeMenu === 'settings' ? 'bg-gray-200' : 'hover:bg-gray-200'}`}
            onClick={() => setActiveMenu('settings')}
          >
            <Settings className="w-6 h-6 mb-1" />
            <span className="text-xs text-gray-600 truncate w-full text-center">
              {t('Settings')}
            </span>
          </div>
          <div
            className={`flex flex-col items-center p-3 cursor-pointer transition-colors duration-300 border-b border-gray-200 w-[80px] ${activeMenu === 'prompts' ? 'bg-gray-200' : 'hover:bg-gray-200'}`}
            onClick={() => setActiveMenu('prompts')}
          >
            <FileText className="w-6 h-6 mb-1" />
            <span className="text-xs text-gray-600 truncate w-full text-center">
              {t('Prompts')}
            </span>
          </div>
        </div>
        <BottomControl />
      </div>
      <div className="flex-1 overflow-hidden">{renderContent()}</div>
    </div>
  )
}

export default Sidebar
