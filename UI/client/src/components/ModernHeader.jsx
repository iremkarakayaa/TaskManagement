import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import InvitationNotifications from './InvitationNotifications';

const ModernHeader = ({ user, onLogout }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [allUserBoards, setAllUserBoards] = useState([]);

    // Kullanıcının panolarını yükle
    useEffect(() => {
        if (user?.id) {
            fetchUserBoards();
        }
    }, [user?.id]);

    const fetchUserBoards = async () => {
        try {
            const API_BASE = "http://localhost:5035/api";
            const [ownedBoards, memberBoards] = await Promise.all([
                fetch(`${API_BASE}/boards/user/${user.id}`).then(res => res.json()),
                fetch(`${API_BASE}/boardcollaboration/user/${user.id}/boards`).then(res => res.json())
            ]);

            // Panoları birleştir ve tekrarları kaldır
            const allBoards = [...ownedBoards, ...memberBoards];
            const uniqueBoards = allBoards.filter((board, index, self) => 
                index === self.findIndex(b => b.id === board.id)
            );
            
            setAllUserBoards(uniqueBoards);
        } catch (err) {
            console.error('Kullanıcı panoları yüklenirken hata:', err);
        }
    };

    const handleLogout = () => {
        onLogout();
        navigate('/login');
    };

    const isActive = (path) => {
        return location.pathname === path;
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchResults.length > 0) {
            // İlk sonuca git
            navigateToBoard(searchResults[0]);
        }
    };

    const handleSearchInputChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        
        if (query.trim().length > 0) {
            // Gerçek zamanlı arama
            const filteredBoards = allUserBoards.filter(board => 
                board.name.toLowerCase().includes(query.toLowerCase()) ||
                (board.description && board.description.toLowerCase().includes(query.toLowerCase()))
            );
            setSearchResults(filteredBoards);
            setShowSearchResults(true);
        } else {
            setSearchResults([]);
            setShowSearchResults(false);
        }
    };

    const navigateToBoard = (board) => {
        setSearchQuery('');
        setSearchResults([]);
        setShowSearchResults(false);
        
        // User bilgisini localStorage'dan kontrol et
        try {
            const storedUser = localStorage.getItem('authUser');
            if (!storedUser) {
                console.error('User bilgisi localStorage\'da bulunamadı');
                navigate('/login');
                return;
            }
        } catch (err) {
            console.error('localStorage okuma hatası:', err);
            navigate('/login');
            return;
        }
        
        navigate(`/board/${board.id}`);
    };

    const handleSearchBlur = () => {
        // Biraz gecikme ile kapat (dropdown'a tıklama için zaman tanı)
        setTimeout(() => {
            setShowSearchResults(false);
        }, 200);
    };

    return (
        <header className="modern-header">
            <div className="modern-header-content">
                {/* Sol taraf - Logo ve Navigasyon */}
                <div className="header-left">
                    <div className="logo-section" onClick={() => navigate('/dashboard')}>
                        <div className="logo-icon">📋</div>
                        <span className="logo-text">TaskManager</span>
                    </div>
                </div>

                {/* Orta - Arama */}
                <div className="header-center">
                    <form onSubmit={handleSearch} className="search-form">
                        <div className="search-container">
                            <div className="search-icon">🔍</div>
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Panolarımda ara..."
                                value={searchQuery}
                                onChange={handleSearchInputChange}
                                onBlur={handleSearchBlur}
                                onFocus={() => searchQuery.trim().length > 0 && setShowSearchResults(true)}
                            />
                            
                            {/* Arama Sonuçları Dropdown */}
                            {showSearchResults && searchResults.length > 0 && (
                                <div className="search-results-dropdown">
                                    {searchResults.map((board) => (
                                        <div
                                            key={board.id}
                                            className="search-result-item"
                                            onClick={() => navigateToBoard(board)}
                                        >
                                            <div className="search-result-title">{board.name}</div>
                                            {board.description && (
                                                <div className="search-result-description">{board.description}</div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                            
                            {showSearchResults && searchResults.length === 0 && searchQuery.trim().length > 0 && (
                                <div className="search-results-dropdown">
                                    <div className="search-no-results">
                                        Arama kriterlerinize uygun pano bulunamadı
                                    </div>
                                </div>
                            )}
                        </div>
                    </form>
                </div>

                {/* Sağ taraf - Bildirimler ve Profil */}
                <div className="header-right">
                    {user && (
                        <>
                            <InvitationNotifications 
                                userId={user.id} 
                                onInvitationAccepted={(boardId) => {
                                    window.location.reload();
                                }}
                            />
                            
                            <div className="user-menu">
                                <button
                                    className="user-button"
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                >
                                    <svg className="user-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                        <circle cx="12" cy="7" r="4"/>
                                    </svg>
                                </button>
                                
                                {showUserMenu && (
                                    <div className="user-dropdown">
                                        <div className="user-info">
                                            <div className="user-avatar-large">
                                                {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                                            </div>
                                            <div className="user-details">
                                                <div className="user-name">{user.username || 'Kullanıcı'}</div>
                                                <div className="user-email">{user.email}</div>
                                            </div>
                                        </div>
                                        <div className="dropdown-divider"></div>
                                        <button className="dropdown-item" onClick={handleLogout}>
                                            Çıkış Yap
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};

export default ModernHeader;
