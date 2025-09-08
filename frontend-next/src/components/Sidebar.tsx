import React from 'react';
import HomeIcon from './icons/HomeIcon';
import UsersIcon from './icons/UsersIcon';
import FileTextIcon from './icons/FileTextIcon';
import BellIcon from './icons/BellIcon';
import LogOutIcon from './icons/LogOutIcon';

const Sidebar = ({ onLogout }: { onLogout: () => void }) => {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2 className="sidebar-logo">Hisab Cal</h2>
      </div>
      <nav className="sidebar-nav">
        <a href="#" className="nav-item active">
          <HomeIcon className="nav-icon" />
          <span>Dashboard</span>
        </a>
        <a href="#" className="nav-item">
          <UsersIcon className="nav-icon" />
          <span>Friends</span>
        </a>
        <a href="/notifications" className="nav-item">
          <BellIcon className="nav-icon" />
          <span>Notifications</span>
        </a>
        <a href="#" className="nav-item">
          <FileTextIcon className="nav-icon" />
          <span>Reports</span>
        </a>
      </nav>
      <div className="sidebar-footer">
        <button onClick={onLogout} className="logout-btn">
          <LogOutIcon className="nav-icon" />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
