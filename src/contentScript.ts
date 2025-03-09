// 监听文本选择事件并显示浮动菜单
import { FloatMenuUI } from "./ui/FloatMenuUI";

class FloatMenu {
  private menuUI: FloatMenuUI;
  private selectedText: string = "";
  private lastMouseUpTime: number = 0;

  constructor() {
    this.menuUI = new FloatMenuUI();
    // 初始化事件监听
    document.addEventListener("mouseup", this.handleTextSelection.bind(this));
    document.addEventListener("click", this.handleDocumentClick.bind(this));
  }

  private handleTextSelection(event: MouseEvent): void {
    this.lastMouseUpTime = event.timeStamp;
    const selection = window.getSelection()?.toString()?.trim();
    console.log(selection);
    // 未选中文本或选中文本为空或已经显示过菜单，隐藏菜单并重置选中文本
    if (!selection || selection === "" || this.selectedText) {
      this.menuUI.removeMenu();
      this.selectedText = "";
      return;
    }

    this.selectedText = selection;
    const menuElement = this.menuUI.createMenu(event);
    console.log(menuElement);

    if (document.body) {
      document.body.appendChild(menuElement);
    } else {
      console.error("Document body not found");
    }
  }

  private handleDocumentClick(event: MouseEvent): void {
    // 如果点击事件是由mouseup事件触发的文本选择操作，不隐藏菜单
    if (event.type === "click" && event.timeStamp - this.lastMouseUpTime < 50) {
      return;
    }
    // 点击页面其他区域时隐藏菜单
    const menuElement = document.querySelector(".float-ai-menu");
    if (menuElement && !menuElement.contains(event.target as Node)) {
      this.menuUI.removeMenu();
      this.selectedText = "";
    }
  }

  // private handleAskAI(): void {
  //   if (this.selectedText) {
  //     // 发送消息到扩展的后台脚本
  //     chrome.runtime.sendMessage({
  //       type: "chat",
  //       content: this.selectedText,
  //     });

  //     // 隐藏菜单
  //     this.menuUI.removeMenu();
  //   }
  // }
}

// 初始化浮动菜单
new FloatMenu();
console.log('Hello, FloatMenu!')
