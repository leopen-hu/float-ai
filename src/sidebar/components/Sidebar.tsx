import { useState, useRef } from 'react'
import './Sidebar.css'

interface SidebarProps {
  children: React.ReactNode
}

const Sidebar: React.FC<SidebarProps> = ({ children }) => {
  const [activeMenu, setActiveMenu] = useState('chat')
  const sidebarRef = useRef<HTMLDivElement>(null)

  return (
    <div className="sidebar" ref={sidebarRef}>
      <div className="sidebar-menu">
        <div
          className={`menu-item ${activeMenu === 'chat' ? 'active' : ''}`}
          onClick={() => setActiveMenu('chat')}
        >
          <span className="menu-icon">💬</span>
          <span className="menu-text">对话</span>
        </div>
        <div
          className={`menu-item ${activeMenu === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveMenu('settings')}
        >
          <span className="menu-icon">⚙️</span>
          <span className="menu-text">设置</span>
        </div>
      </div>
      <div className="sidebar-content">{children}</div>
    </div>
  )
}

export default Sidebar
