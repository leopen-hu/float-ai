import * as React from "react"
import {
  MessageSquare,
  FileText,
  Bot
} from "lucide-react"

import { NavMain } from "@/sidebar/components/nav-main"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import BottomControl from "./BottomControl"

// This is sample data.
const data = {
  navMain: [
    {
      title: "Chats",
      url: "/chats",
      icon: MessageSquare,
      isActive: true,
    },
    {
      title: "Models",
      url: "/models",
      icon: Bot,
    },
    {
      title: "Prompts",
      url: "/prompts",
      icon: FileText,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader></SidebarHeader>
      <SidebarContent>
      <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <BottomControl />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
