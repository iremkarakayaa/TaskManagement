import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import InvitationNotifications from './InvitationNotifications';
import NotificationCenter from './NotificationCenter';
import { getUnreadNotificationCount } from '../services/notificationService';

const Header = ({ user, onLogout }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    const handleLogout = () => {
        onLogout();
        navigate('/login');
    };

    const isActive = (path) => {
        return location.pathname === path;
    };

    // Bildirim sayısını yükle
    useEffect(() => {
        if (user?.id) {
            loadUnreadCount();
            // Her 30 saniyede bir bildirim sayısını güncelle
            const interval = setInterval(loadUnreadCount, 30000);
            return () => clearInterval(interval);
        }
    }, [user?.id]);

    const loadUnreadCount = async () => {
        try {
            const count = await getUnreadNotificationCount(user.id);
            setUnreadCount(count);
        } catch (error) {
            console.error('Error loading unread count:', error);
        }
    };

    return (
        <header className="header">
            <div className="container">
                <div className="header-content">
                    <div className="logo" onClick={() => navigate('/dashboard')}>
                        📋 TaskManager
                    </div>
                    
                    <nav className="nav-menu">
                        {user && (
                            <>
                                <button
                                    className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
                                    onClick={() => navigate('/dashboard')}
                                >
                                    Panolar
                                </button>
                                
                                <InvitationNotifications 
                                    userId={user.id} 
                                    onInvitationAccepted={(boardId) => {
                                        // Davet kabul edildiğinde dashboard'u yenile
                                        window.location.reload();
                                    }}
                                />
                                
                                <div className="user-menu">
                                    <button
                                        className="nav-link"
                                        onClick={() => setShowUserMenu(!showUserMenu)}
                                    >
                                        👤 {user.username || 'Kullanıcı'}
                                    </button>
                                    
                                    {showUserMenu && (
                                        <div className="user-dropdown">
                                            <button
                                                className="dropdown-item"
                                                onClick={handleLogout}
                                            >
                                                Çıkış Yap
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </nav>
                </div>
            </div>
        </header>
    );
};

export default Header;

