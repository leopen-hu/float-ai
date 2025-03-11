import { FloatMenuUI } from './FloatMenuUI'

class FloatMenu {
  private menuUI: FloatMenuUI
  private selectedText: string = ''

  constructor() {
    this.menuUI = new FloatMenuUI()
    // 初始化事件监听
    document.addEventListener('mouseup', this.handleSelectionChange.bind(this))
  }

  private handleSelectionChange(): void {
    console.log('handleSelectionChange')
    const selection = window.getSelection()?.toString()?.trim()

    // 如果文本选择为空或与上次相同，则隐藏菜单并重置文本选择
    if (!selection || selection === '' || selection === this.selectedText) {
      this.menuUI.removeMenu()
      this.selectedText = ''
      return
    }

    // 获取选中文本的位置信息
    const range = window.getSelection()?.getRangeAt(0)
    if (!range) return

    // const rect = range.getBoundingClientRect()
    // const event = new MouseEvent('mouseup', {
    //   clientX: rect.right,
    //   clientY: rect.bottom,
    // })

    this.menuUI.removeMenu()
    this.selectedText = selection
    const menuElement = this.menuUI.createMenu()

    if (document.body) {
      document.body.appendChild(menuElement)
    } else {
      console.error('Document body not found')
    }
  }
}

// 初始化浮动菜单
new FloatMenu()
console.log('FloatMenu initialized!')
