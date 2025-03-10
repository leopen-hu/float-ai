import { computePosition, flip, shift, offset } from '@floating-ui/dom'

export interface MenuItem {
  id: string
  text: string
  icon?: string
  children?: MenuItem[]
  onClick?: () => void
}

export class FloatMenuUI {
  private menuElement: HTMLElement | null = null
  private activeSubMenu: HTMLElement | null = null
  private menuItems: MenuItem[] = [
    {
      id: 'copy',
      text: '复制到',
      icon: chrome.runtime.getURL('icons/icon16.png'),
      children: [
        {
          id: 'copy-sidebar',
          text: '侧边栏',
          onClick: () => console.log('Copy to Sidebar'),
        },
        {
          id: 'copy-clipboard',
          text: '剪贴板',
          onClick: () => console.log('Copy to Clipboard'),
        },
      ],
    },
    {
      id: 'translate',
      text: '翻译',
      icon: chrome.runtime.getURL('icons/icon16.png'),
      onClick: () => console.log('Translate'),
    },
    {
      id: 'search',
      text: '搜索',
      icon: chrome.runtime.getURL('icons/icon16.png'),
      children: [
        {
          id: 'search-google',
          text: 'Google',
          onClick: () => console.log('Search Google'),
        },
        {
          id: 'search-bing',
          text: 'Bing',
          onClick: () => console.log('Search Bing'),
        },
      ],
    },
  ]

  constructor() {
    this.createStyles()
  }

  private createStyles(): void {
    const styleElement = document.createElement('style')
    styleElement.textContent = `
      .float-ai-menu {
        position: fixed;
        z-index: 2147483647;
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        padding: 4px;
        min-width: 120px;
        animation: float-ai-fade-in 0.2s ease-in-out;
      }

      .float-ai-menu ul {
        list-style: none;
        margin: 0;
        padding: 0;
      }

      .float-ai-menu-item {
        display: flex;
        align-items: center;
        padding: 8px 12px;
        cursor: pointer;
        border-radius: 4px;
        position: relative;
      }

      .float-ai-menu-item:hover {
        background-color: #f5f5f5;
      }

      .float-ai-menu-item img {
        width: 16px;
        height: 16px;
        margin-right: 8px;
      }

      .float-ai-menu-item-text {
        flex-grow: 1;
      }

      .float-ai-menu-item-arrow {
        margin-left: 8px;
      }

      .float-ai-submenu {
        position: absolute;
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        padding: 4px;
        min-width: 120px;
        display: none;
      }

      @keyframes float-ai-fade-in {
        from {
          opacity: 0;
          transform: translateY(-10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `
    document.head.appendChild(styleElement)
  }

  public createMenu(event: MouseEvent): HTMLElement {
    this.menuElement = document.createElement('div')
    this.menuElement.className = 'float-ai-menu'

    const ul = document.createElement('ul')
    this.menuElement.appendChild(ul)

    this.createMenuItems(ul, this.menuItems)
    this.setMenuPosition(event)

    return this.menuElement
  }

  private createMenuItems(parentElement: HTMLElement, items: MenuItem[]): void {
    items.forEach((item) => {
      const li = document.createElement('li')
      const menuItem = document.createElement('div')
      menuItem.className = 'float-ai-menu-item'

      if (item.icon) {
        const icon = document.createElement('img')
        icon.src = item.icon
        menuItem.appendChild(icon)
      }

      const text = document.createElement('span')
      text.className = 'float-ai-menu-item-text'
      text.textContent = item.text
      menuItem.appendChild(text)

      if (item.children) {
        const arrow = document.createElement('span')
        arrow.className = 'float-ai-menu-item-arrow'
        arrow.textContent = '▶'
        menuItem.appendChild(arrow)

        const subMenu = document.createElement('div')
        subMenu.className = 'float-ai-submenu'
        const subUl = document.createElement('ul')
        subMenu.appendChild(subUl)
        this.createMenuItems(subUl, item.children)
        li.appendChild(subMenu)

        menuItem.addEventListener('mouseenter', () => {
          if (this.activeSubMenu && this.activeSubMenu !== subMenu) {
            this.activeSubMenu.style.display = 'none'
          }
          this.activeSubMenu = subMenu
          subMenu.style.display = 'block'
          this.positionSubMenu(menuItem, subMenu)
        })
      } else if (item.onClick) {
        menuItem.addEventListener('click', (e) => {
          e.stopPropagation()
          item.onClick!()
          this.removeMenu()
        })
      }

      li.appendChild(menuItem)
      parentElement.appendChild(li)
    })
  }

  private async positionSubMenu(
    parentItem: HTMLElement,
    subMenu: HTMLElement,
  ): Promise<void> {
    const { x, y } = await computePosition(parentItem, subMenu, {
      placement: 'right-start',
      middleware: [offset(4), flip(), shift({ padding: 8 })],
    })

    Object.assign(subMenu.style, {
      left: `${x}px`,
      top: `${y}px`,
    })
  }

  private async setMenuPosition(event: MouseEvent): Promise<void> {
    if (!this.menuElement) return

    const virtualElement = {
      getBoundingClientRect() {
        return {
          x: event.clientX,
          y: event.clientY,
          width: 0,
          height: 0,
          top: event.clientY,
          right: event.clientX,
          bottom: event.clientY,
          left: event.clientX,
        }
      },
    }

    const { x, y } = await computePosition(virtualElement, this.menuElement, {
      placement: 'bottom-start',
      middleware: [offset(4), flip(), shift({ padding: 8 })],
    })

    Object.assign(this.menuElement.style, {
      left: `${x}px`,
      top: `${y}px`,
    })
  }

  public removeMenu(): void {
    if (this.menuElement && this.menuElement.parentNode) {
      this.menuElement.parentNode.removeChild(this.menuElement)
      this.menuElement = null
      this.activeSubMenu = null
    }
  }
}
