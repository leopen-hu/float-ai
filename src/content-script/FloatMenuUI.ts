import { computePosition, flip, shift, offset } from '@floating-ui/dom'

export interface MenuItem {
  id: string
  text: string
  icon?: string
  onClick?: () => void
}

export class FloatMenuUI {
  private menuElement: HTMLElement | null = null
  private resultElement: HTMLElement | null = null
  private menuItems: MenuItem[] = []

  constructor() {
    this.createStyles()
    this.loadPromptMenuItems()
  }

  private async loadPromptMenuItems() {
    try {
      const prompts = await promptService.getPrompts()
      this.menuItems = prompts.map(prompt => ({
        id: prompt.id,
        text: prompt.name,
        onClick: () => {
          // 处理提示词的应用逻辑
          console.log('应用提示词:', prompt)
        }
      }))
      // 添加其他固定的菜单项
      this.menuItems.push(
        {
          id: 'copy-clipboard',
          text: 'Copy to Clipboard',
          onClick: () => console.log('Copy to Clipboard')
        },
        {
          id: 'translate',
          text: 'Translate',
          onClick: () => console.log('Translate')
        }
      )
    } catch (error) {
      console.error('加载提示词失败:', error)
    }
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
        width: 360px;
        animation: float-ai-fade-in 0.2s ease-in-out;
        font-size: 14px;
        user-select: none;
        pointer-events: auto;
      }

      .float-ai-menu ul {
        display: flex;
        gap: 4px;
        flex-wrap: wrap;
        list-style: none;
        margin: 0;
        padding: 0;
      }

      .float-ai-menu ul li.back-button {
        margin-left: auto;
      }

      .float-ai-menu-item {
        display: flex;
        align-items: center;
        padding: 4px;
        cursor: pointer;
        border: 1px solid #e0e0e0;
        border-radius: 4px;
      }

      .back-button .float-ai-menu-item {
        padding: 8px;
      }

      .float-ai-menu-item.disabled {
        opacity: 0.5;
        cursor: not-allowed;
        pointer-events: none;
      }

      .float-ai-menu-item img {
        width: 16px;
        height: 16px;
        margin-right: 4px;
      }

      .back-button .float-ai-menu-item img {
        margin-right: 0;
      }

      .float-ai-menu-item:hover {
        background-color: #f5f5f5;
      }

      .float-ai-menu-item-text {
        flex-grow: 1;
      }

      .float-ai-menu-divider {
        width: 100%;
        height: 1px;
        background-color: #e0e0e0;
        margin: 8px 0;
      }

      .float-ai-menu-result {
        padding: 8px;
        font-size: 14px;
        color: #333;
        position: relative;
      }

      .float-ai-menu-result-copy {
        position: absolute;
        top: 8px;
        right: 8px;
        width: 16px;
        height: 16px;
        cursor: pointer;
        opacity: 0.6;
        transition: opacity 0.2s;
      }

      .float-ai-menu-result-copy:hover {
        opacity: 1;
      }

      .float-ai-menu-loading {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 8px;
        color: #666;
      }

      .float-ai-menu-loading::after {
        content: '';
        width: 16px;
        height: 16px;
        margin-left: 8px;
        border: 2px solid #f3f3f3;
        border-top: 2px solid #666;
        border-radius: 50%;
        animation: float-ai-spin 1s linear infinite;
      }

      @keyframes float-ai-spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
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

  public createMenu(): HTMLElement {
    this.menuElement = document.createElement('div')
    this.menuElement.className = 'float-ai-menu'

    const ul = document.createElement('ul')
    this.menuElement.appendChild(ul)

    this.createMenuItems(ul, this.menuItems)
    this.setMenuPosition()

    // 阻止浮层事件冒泡
    this.menuElement.addEventListener('mouseup', (e) => {
      e.stopPropagation()
    })
    this.menuElement.addEventListener('click', (e) => {
      e.stopPropagation()
    })
    this.menuElement.addEventListener('mousedown', (e) => {
      e.stopPropagation()
    })

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

      if (item.onClick) {
        menuItem.addEventListener('click', async (e) => {
          e.stopPropagation()
          e.preventDefault()

          // 禁用当前菜单项
          menuItem.classList.add('disabled')
          menuItem.setAttribute('disabled', 'true')

          // 隐藏其他菜单项 显示当前菜单和返回按钮
          const allItems = parentElement.querySelectorAll('li')
          allItems.forEach((li) => {
            li.style.display = li.classList.contains('back-button')
              ? 'block'
              : 'none'
          })
          li.style.display = 'block'

          // 显示加载状态
          this.showLoading()

          try {
            // 执行点击回调
            await item.onClick!()
            // 显示结果
            this.showResult('操作已完成')
          } catch (error: unknown) {
            this.showResult('操作失败：' + error)
          }
        })
      }

      li.appendChild(menuItem)
      parentElement.appendChild(li)
    })

    // back button
    const li = document.createElement('li')
    li.className = 'back-button'
    li.style.display = 'none'
    const backItem = document.createElement('div')
    backItem.className = 'float-ai-menu-item'
    const icon = document.createElement('img')
    icon.src = chrome.runtime.getURL('icons/back.png')
    backItem.appendChild(icon)
    backItem.addEventListener('click', () => {
      // 显示所有菜单项
      const allItems = parentElement.querySelectorAll('li')
      allItems.forEach((li) => {
        li.style.display = 'block'
        const item = li.querySelector('.float-ai-menu-item')
        item?.removeAttribute('disabled')
        item?.classList.remove('disabled')
      })
      // 隐藏当前菜单项
      li.style.display = 'none'
      this.clearDivider()
      this.clearResult()
    })
    li.appendChild(backItem)

    parentElement.appendChild(li)
  }

  private async setMenuPosition(): Promise<void> {
    if (!this.menuElement) return

    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return

    const range = selection.getRangeAt(0)
    const rect = range.getBoundingClientRect()
    const { left, right, bottom } = rect
    const virtualElement = {
      getBoundingClientRect() {
        return {
          // fix: 单行文本过长时（比如有些 markdown code 不会换行）菜单位置远离
          x: (right + left) / 2,
          y: bottom,
          width: 0,
          height: 0,
          top: bottom,
          right: (right + left) / 2,
          bottom: bottom,
          left: (right + left) / 2,
        }
      },
    }

    const { x, y } = await computePosition(virtualElement, this.menuElement, {
      strategy: 'fixed',
      placement: 'bottom-start',
      middleware: [offset(4), flip(), shift({ padding: 8 })],
    })
    console.log(right, bottom)
    console.log(x, y)

    Object.assign(this.menuElement.style, {
      left: `${x}px`,
      top: `${y}px`,
    })
  }

  private showLoading(): void {
    this.clearResult()
    const loadingElement = document.createElement('div')
    loadingElement.className = 'float-ai-menu-loading'
    loadingElement.textContent = '处理中'
    this.appendResult(loadingElement)
  }

  private showResult(message: string): void {
    this.clearResult()
    const resultElement = document.createElement('div')
    resultElement.className = 'float-ai-menu-result'
    resultElement.textContent = message

    const copyButton = document.createElement('img')
    copyButton.className = 'float-ai-menu-result-copy'
    copyButton.src = chrome.runtime.getURL('icons/copy.png')
    copyButton.title = 'copy'
    copyButton.addEventListener('click', () => {
      navigator.clipboard
        .writeText(message)
        .then(() => {
          copyButton.src = chrome.runtime.getURL('icons/copyed.png')
          setTimeout(() => {
            copyButton.src = chrome.runtime.getURL('icons/copy.png')
          }, 2000)
        })
        .catch((err) => {
          console.error('复制失败:', err)
        })
    })
    resultElement.appendChild(copyButton)

    this.appendResult(resultElement)
  }

  private clearResult(): void {
    if (this.resultElement) {
      this.resultElement.remove()
      this.resultElement = null
    }
  }

  private appendResult(element: HTMLElement): void {
    if (!this.menuElement) return

    this.addDivider()

    this.resultElement = element
    this.menuElement.appendChild(element)
  }

  private addDivider(): void {
    if (!this.menuElement) return

    const existingDivider = this.menuElement.querySelector(
      '.float-ai-menu-divider',
    )
    if (!existingDivider) {
      const divider = document.createElement('div')
      divider.className = 'float-ai-menu-divider'
      this.menuElement.appendChild(divider)
    }
  }

  private clearDivider(): void {
    if (!this.menuElement) return

    const existingDivider = this.menuElement.querySelector(
      '.float-ai-menu-divider',
    )
    if (existingDivider) {
      existingDivider.remove()
    }
  }

  public removeMenu(): void {
    if (this.menuElement && this.menuElement.parentNode) {
      // TODO remove listener
      this.menuElement.parentNode.removeChild(this.menuElement)
      this.menuElement = null
      this.resultElement = null
    }
  }
}
import { promptService } from '../sidebar/services/promptService'
