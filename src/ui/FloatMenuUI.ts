// 浮动菜单UI构建类

export interface FloatMenuPosition {
  x: number;
  y: number;
}

export class FloatMenuUI {
  private menuElement: HTMLElement | null = null;

  constructor() {
    this.createStyles();
  }

  private createStyles(): void {
    const styleElement = document.createElement("style");
    styleElement.textContent = `
    .float-ai-menu {
      position: fixed;
      zIndex: 2147483647;
      display: flex;
      visibility: visible;
      backgroundColor: white;
      borderRadius: 8px;
      boxShadow: 0 2px 10px rgba(0, 0, 0, 0.2);
      padding: 8px;
      animation: float-ai-fade-in 0.2s ease-in-out;
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
    `;
    document.head.appendChild(styleElement);
  }

  public createMenu(event: MouseEvent): HTMLElement {
    this.menuElement = document.createElement("ul");
    this.menuElement.className = "float-ai-menu";
    this.setMenuPosition(event);
    this.createMenuItems(this.menuElement);

    return this.menuElement;
  }

  private createMenuItems(parentNode: Node) {
    const items = [
      {
        id: 1,
        icon: chrome.runtime.getURL("icons/icon16.png"),
        text: "Copy to SideBar",
        onClick: () => {
          console.log("Copy to SideBar");
        },
      },
      {
        id: 2,
        icon: chrome.runtime.getURL("icons/icon16.png"),
        text: "Copy to SideBar 2",
        onClick: () => {
          console.log("Copy to SideBar 2");
        },
      },
      {
        id: 3,
        icon: chrome.runtime.getURL("icons/icon16.png"),
        text: "Copy to SideBar 3",
        onClick: () => {
          console.log("Copy to SideBar 3");
        },
      },
    ];
    items.map((item) => {
      const {icon, text} = item;
      const menuItem = document.createElement("li");
      menuItem.className = "menu-item";

      const iconElement = document.createElement("img");
      iconElement.src = icon;
      iconElement.style.width = "16px";
      iconElement.style.height = "16px";
      menuItem.appendChild(iconElement);
      menuItem.title = text;
      parentNode.appendChild(menuItem);
    });
  }

  private setMenuPosition(event: MouseEvent): void {
    if (!this.menuElement) return;

    const { innerWidth } = window;
    const { innerHeight } = window;
    const menuWidth = 100; // 预估菜单宽度
    const menuHeight = 40; // 预估菜单高度

    let x = event.clientX;
    let y = event.clientY + 10;

    // 确保菜单不会超出右边界
    if (x + menuWidth > innerWidth) {
      x = innerWidth - menuWidth;
    }

    // 确保菜单不会超出底部边界
    if (y + menuHeight > innerHeight) {
      y = event.clientY - menuHeight - 10; // 在选区上方显示
    }

    Object.assign(this.menuElement.style, {
      left: `${x}px`,
      top: `${y}px`,
    });
  }

  public removeMenu(): void {
    if (this.menuElement && this.menuElement.parentNode) {
      console.log("removeMenu")
      this.menuElement.parentNode.removeChild(this.menuElement);
      this.menuElement = null;
    }
  }
}
