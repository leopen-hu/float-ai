import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
// import App from './App.tsx'
import { I18nService } from './services/i18nService'

// 确保i18next实例在应用启动时初始化
I18nService.getInstance()

// Import the generated route tree
import { routeTree } from './routeTree.gen'
import { createMemoryHistory, createRouter, RouterProvider } from '@tanstack/react-router'

const memoryHistory = createMemoryHistory({
  initialEntries: ['/'], // Pass your initial url
})
// Create a new router instance
const router = createRouter({ routeTree, history: memoryHistory })

console.log(router)

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
