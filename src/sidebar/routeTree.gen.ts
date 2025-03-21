/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as PromptsImport } from './routes/prompts'
import { Route as ModelsImport } from './routes/models'
import { Route as ChatsImport } from './routes/chats'

// Create/Update Routes

const PromptsRoute = PromptsImport.update({
  id: '/prompts',
  path: '/prompts',
  getParentRoute: () => rootRoute,
} as any)

const ModelsRoute = ModelsImport.update({
  id: '/models',
  path: '/models',
  getParentRoute: () => rootRoute,
} as any)

const ChatsRoute = ChatsImport.update({
  id: '/chats',
  path: '/chats',
  getParentRoute: () => rootRoute,
} as any)

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/chats': {
      id: '/chats'
      path: '/chats'
      fullPath: '/chats'
      preLoaderRoute: typeof ChatsImport
      parentRoute: typeof rootRoute
    }
    '/models': {
      id: '/models'
      path: '/models'
      fullPath: '/models'
      preLoaderRoute: typeof ModelsImport
      parentRoute: typeof rootRoute
    }
    '/prompts': {
      id: '/prompts'
      path: '/prompts'
      fullPath: '/prompts'
      preLoaderRoute: typeof PromptsImport
      parentRoute: typeof rootRoute
    }
  }
}

// Create and export the route tree

export interface FileRoutesByFullPath {
  '/chats': typeof ChatsRoute
  '/models': typeof ModelsRoute
  '/prompts': typeof PromptsRoute
}

export interface FileRoutesByTo {
  '/chats': typeof ChatsRoute
  '/models': typeof ModelsRoute
  '/prompts': typeof PromptsRoute
}

export interface FileRoutesById {
  __root__: typeof rootRoute
  '/chats': typeof ChatsRoute
  '/models': typeof ModelsRoute
  '/prompts': typeof PromptsRoute
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths: '/chats' | '/models' | '/prompts'
  fileRoutesByTo: FileRoutesByTo
  to: '/chats' | '/models' | '/prompts'
  id: '__root__' | '/chats' | '/models' | '/prompts'
  fileRoutesById: FileRoutesById
}

export interface RootRouteChildren {
  ChatsRoute: typeof ChatsRoute
  ModelsRoute: typeof ModelsRoute
  PromptsRoute: typeof PromptsRoute
}

const rootRouteChildren: RootRouteChildren = {
  ChatsRoute: ChatsRoute,
  ModelsRoute: ModelsRoute,
  PromptsRoute: PromptsRoute,
}

export const routeTree = rootRoute
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/chats",
        "/models",
        "/prompts"
      ]
    },
    "/chats": {
      "filePath": "chats.tsx"
    },
    "/models": {
      "filePath": "models.tsx"
    },
    "/prompts": {
      "filePath": "prompts.tsx"
    }
  }
}
ROUTE_MANIFEST_END */
