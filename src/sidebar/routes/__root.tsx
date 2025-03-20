import {
  createRootRoute,
  Link,
  Outlet,
  redirect,
  useRouterState,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsInProd } from '@tanstack/react-router-devtools'
import { Toaster } from 'sonner'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { Bot, FileText, MessageSquare } from 'lucide-react'
import BottomControl from '../components/BottomControl'

export const Route = createRootRoute({
  beforeLoad: async () => {
    console.log('beforeLoad')
    redirect({ to: '/chats' })
  },
  component: () => (
    <div className="h-screen">
      <Toaster position="top-right" richColors />
      <Sidebar />
    </div>
  ),
})

function Sidebar() {
  const { t } = useTranslation()
  const [activeMenu, setActiveMenu] = useState('chat')
  console.log(useRouterState().matches[0].fullPath, window.location.pathname)

  // const renderContent = () => {
  //   switch (activeMenu) {
  //     case 'models':
  //       return <ModelManager />
  //     case 'prompts':
  //       return <PromptManager />
  //     case 'settings':
  //       return <div>设置页面</div>
  //     case 'chat':
  //       return <ChatManager />
  //     default:
  //       return <ChatManager />
  //   }
  // }

  return (
    <div className="flex h-screen relative bg-white border-l border-gray-200">
      <div className="flex flex-col justify-between bg-gray-100 border-r border-gray-200 pb-4">
        <div className="flex flex-col">
          <div
            className={`flex flex-col items-center p-3 cursor-pointer transition-colors duration-300 border-b border-gray-200 w-[80px] ${activeMenu === 'chat' ? 'bg-gray-200' : 'hover:bg-gray-200'}`}
            onClick={() => setActiveMenu('chat')}
          >
            <Link to="/chats">
              <MessageSquare className="w-6 h-6 mb-1" />
              <span className="text-xs text-gray-600 truncate w-full text-center">
                {t('Chat')}
              </span>
            </Link>
          </div>
          <div
            className={`flex flex-col items-center p-3 cursor-pointer transition-colors duration-300 border-b border-gray-200 w-[80px] ${activeMenu === 'models' ? 'bg-gray-200' : 'hover:bg-gray-200'}`}
            onClick={() => setActiveMenu('models')}
          >
            <Link to="/models">
              <Bot className="w-6 h-6 mb-1" />
              <span className="text-xs text-gray-600 truncate w-full text-center">
                {t('Models')}
              </span>
            </Link>
          </div>
          <div
            className={`flex flex-col items-center p-3 cursor-pointer transition-colors duration-300 border-b border-gray-200 w-[80px] ${activeMenu === 'prompts' ? 'bg-gray-200' : 'hover:bg-gray-200'}`}
            onClick={() => setActiveMenu('prompts')}
          >
            <Link to="/prompts">
              <FileText className="w-6 h-6 mb-1" />
              <span className="text-xs text-gray-600 truncate w-full text-center">
                {t('Prompts')}
              </span>
            </Link>
          </div>
        </div>
        <BottomControl />
      </div>
      <div className="flex-1 overflow-hidden p-4">
        <Outlet />
        <TanStackRouterDevtoolsInProd position="bottom-right" />
      </div>
    </div>
  )
}
