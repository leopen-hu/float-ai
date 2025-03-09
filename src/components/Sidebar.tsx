import { useState, useRef, useEffect } from "react";
import "./Sidebar.css";

interface SidebarProps {
  children: React.ReactNode;
}

const Sidebar: React.FC<SidebarProps> = ({ children }) => {
  const [isResizing, setIsResizing] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(400);
  const [activeMenu, setActiveMenu] = useState("chat");
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      
      const newWidth = e.clientX;
      if (newWidth >= 300 && newWidth <= 800) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  return (
    <div
      className="sidebar"
      ref={sidebarRef}
      style={{ width: `${sidebarWidth}px` }}
    >
      <div className="sidebar-menu">
        <div
          className={`menu-item ${activeMenu === "chat" ? "active" : ""}`}
          onClick={() => setActiveMenu("chat")}
        >
          <span className="menu-icon">💬</span>
          <span className="menu-text">对话</span>
        </div>
        <div
          className={`menu-item ${activeMenu === "settings" ? "active" : ""}`}
          onClick={() => setActiveMenu("settings")}
        >
          <span className="menu-icon">⚙️</span>
          <span className="menu-text">设置</span>
        </div>
      </div>
      <div
        className="resize-handle"
        onMouseDown={() => setIsResizing(true)}
      />
      <div className="sidebar-content">
        {children}
      </div>
    </div>
  );
};

export default Sidebar;