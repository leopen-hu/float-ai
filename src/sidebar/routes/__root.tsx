import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtoolsInProd } from '@tanstack/react-router-devtools'
import { Toaster } from 'sonner'
import { AppSidebar } from '../components/app-sidebar'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'

export const Route = createRootRoute({
  component: () => (
    <div className="h-screen">
      <Toaster position="top-right" richColors />
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-14 shrink-0 items-center gap-2">
            <div className="flex flex-1 items-center gap-2 px-3">
              <SidebarTrigger />
              <Separator orientation="vertical" className="mr-2 h-4" />
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 px-4 py-10">
            <Outlet />
            <TanStackRouterDevtoolsInProd position="bottom-right" />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  ),
})
