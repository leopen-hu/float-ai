import { MessageSquare, FileText, Bot } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { NavMain } from '@/sidebar/components/nav-main'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'
import BottomControl from './BottomControl'

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { t } = useTranslation()
  const navMainItems = [
    {
      title: t('Chat'),
      url: '/chats',
      icon: MessageSquare,
    },
    {
      title: t('Models'),
      url: '/models',
      icon: Bot,
    },
    {
      title: t('Prompts'),
      url: '/prompts',
      icon: FileText,
    },
  ]

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader></SidebarHeader>
      <SidebarContent>
        <NavMain items={navMainItems} />
      </SidebarContent>
      <SidebarFooter>
        <BottomControl />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
