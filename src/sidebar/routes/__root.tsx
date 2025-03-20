import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtoolsInProd } from '@tanstack/react-router-devtools'
import { Toaster } from 'sonner'
import { AppSidebar } from '../components/app-sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'

export const Route = createRootRoute({
  component: () => (
    <div className="h-screen">
      <Toaster position="top-right" richColors />
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex h-full flex-col">
            <Outlet />
            <TanStackRouterDevtoolsInProd position="bottom-right" />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  ),
})
