import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = ({ user }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (path) => {
        return location.pathname === path;
    };

    const menuItems = [
        {
            id: 'boards',
            label: 'Panolar',
            icon: '📋',
            path: '/dashboard',
            active: isActive('/dashboard')
        },
        {
            id: 'home',
            label: 'Anasayfa',
            icon: '🏠',
            path: '/home',
            active: isActive('/home')
        }
    ];

    return (
        <aside className="modern-sidebar">
            <div className="sidebar-content">
                <nav className="sidebar-nav">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            className={`sidebar-item ${item.active ? 'active' : ''}`}
                            onClick={() => navigate(item.path)}
                        >
                            <span className="sidebar-icon">{item.icon}</span>
                            <span className="sidebar-label">{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="sidebar-workspaces">
                    <div className="workspace-header">
                        <span className="workspace-title">Çalışma Alanları</span>
                    </div>
                    
                    <div className="workspace-item">
                        <div className="workspace-icon">📋</div>
                        <div className="workspace-info">
                            <div className="workspace-name">TaskManager</div>
                            <div className="workspace-type">Çalışma Alanı</div>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
