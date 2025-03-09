// 监听文本选择事件并显示浮动菜单

interface FloatMenuPosition {
  x: number;
  y: number;
}

class FloatMenu {
  private menuElement: HTMLElement | null = null;
  private selectedText: string = '';
  private lastMouseUpTime: number = 0;

  constructor() {
    // 初始化事件监听
    document.addEventListener('mouseup', this.handleTextSelection.bind(this));
    document.addEventListener('click', this.handleDocumentClick.bind(this));
  }

  private handleTextSelection(event: MouseEvent): void {
    this.lastMouseUpTime = event.timeStamp;
    const selection = window.getSelection();
    console.log(selection)
    if (!selection || selection.toString().trim() === '') {
      this.hideMenu();
      return;
    }

    this.selectedText = selection.toString().trim();
    const position = this.calculateMenuPosition(event);
    console.log(this.selectedText, position)
    this.showMenu(position);
  }

  private calculateMenuPosition(event: MouseEvent): FloatMenuPosition {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const menuWidth = 100; // 预估菜单宽度
    const menuHeight = 40; // 预估菜单高度

    let x = event.clientX;
    let y = event.clientY + 10;

    // 确保菜单不会超出右边界
    if (x + menuWidth > viewportWidth) {
      x = viewportWidth - menuWidth;
    }

    // 确保菜单不会超出底部边界
    if (y + menuHeight > viewportHeight) {
      y = event.clientY - menuHeight - 10; // 在选区上方显示
    }

    return { x, y };
  }

  private showMenu(position: FloatMenuPosition): void {
    console.log('show start');
    this.hideMenu();

    // 创建样式
    const styleElement = document.createElement('style');
    styleElement.textContent = `
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
    `;
    document.head.appendChild(styleElement);

    this.menuElement = document.createElement('div');
    this.menuElement.className = 'float-ai-menu';
    
    const askButton = document.createElement('button');
    askButton.className = 'float-ai-button';
    askButton.textContent = '问AI';
    askButton.addEventListener('click', () => this.handleAskAI());

    Object.assign(this.menuElement.style, {
      position: 'fixed',
      left: `${position.x}px`,
      top: `${position.y}px`,
      zIndex: '2147483647',
      display: 'block',
      visibility: 'visible',
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
      padding: '8px'
    });

    this.menuElement.style.animation = 'float-ai-fade-in 0.2s ease-in-out';

    Object.assign(askButton.style, {
      backgroundColor: '#007bff',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      padding: '6px 12px',
      fontSize: '14px',
      cursor: 'pointer',
      transition: 'background-color 0.2s'
    });

    askButton.addEventListener('mouseover', () => {
      askButton.style.backgroundColor = '#0056b3';
    });
    askButton.addEventListener('mouseout', () => {
      askButton.style.backgroundColor = '#007bff';
    });

    this.menuElement.appendChild(askButton);

    if (document.body) {
      document.body.appendChild(this.menuElement);
    } else {
      console.error('Document body not found');
    }
  }

  private hideMenu(): void {
    console.log('hide start')
    if (this.menuElement && this.menuElement.parentNode) {
      this.menuElement.parentNode.removeChild(this.menuElement);
      this.menuElement = null;
    }
  }

  private handleDocumentClick(event: MouseEvent): void {
    // 如果点击事件是由mouseup事件触发的文本选择操作，不隐藏菜单
    if (event.type === 'click' && event.timeStamp - this.lastMouseUpTime < 50) {
      return;
    }
    // 点击页面其他区域时隐藏菜单
    if (this.menuElement && !this.menuElement.contains(event.target as Node)) {
      this.hideMenu();
    }
  }

  private handleAskAI(): void {
    if (this.selectedText) {
      // 发送消息到扩展的后台脚本
      chrome.runtime.sendMessage({
        type: 'chat',
        content: this.selectedText
      });

      // 隐藏菜单
      this.hideMenu();
    }
  }
}

// 初始化浮动菜单
new FloatMenu();
console.log('Hello, FloatMenu!')
