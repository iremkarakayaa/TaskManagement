import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Header = ({ user, onLogout }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [showUserMenu, setShowUserMenu] = useState(false);

    const handleLogout = () => {
        onLogout();
        navigate('/login');
    };

    const isActive = (path) => {
        return location.pathname === path;
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

