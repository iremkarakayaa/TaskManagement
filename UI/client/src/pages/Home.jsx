import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ModernHeader from '../components/ModernHeader';
import Sidebar from '../components/Sidebar';

const Home = ({ user, onLogout }) => {
    const [recentBoards, setRecentBoards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const API_BASE = "http://localhost:5035/api";

    useEffect(() => {
        fetchRecentBoards();
    }, []);

    const fetchRecentBoards = async () => {
        try {
            setLoading(true);
            // Kullanıcının sahip olduğu panolar
            const ownedBoardsResponse = await axios.get(`${API_BASE}/boards/user/${user.id}`);
            const ownedBoards = ownedBoardsResponse.data;
            
            // Kullanıcının üye olduğu panolar
            const memberBoardsResponse = await axios.get(`${API_BASE}/boardcollaboration/user/${user.id}/boards`);
            const memberBoards = memberBoardsResponse.data;
            
            // Tüm panoları birleştir ve tekrarları kaldır
            const allBoards = [...ownedBoards];
            memberBoards.forEach(memberBoard => {
                if (!allBoards.find(board => board.id === memberBoard.id)) {
                    allBoards.push(memberBoard);
                }
            });
            
            // Son 4 panoyu al
            setRecentBoards(allBoards.slice(0, 4));
            setError(null);
        } catch (err) {
            setError('Panolar yüklenirken bir hata oluştu.');
            console.error('Error fetching recent boards:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleBoardClick = (boardId) => {
        navigate(`/board/${boardId}`);
    };

    if (loading) {
        return (
            <div className="modern-app">
                <ModernHeader user={user} onLogout={onLogout} />
                <div className="modern-layout">
                    <Sidebar user={user} />
                    <main className="modern-main">
                        <div className="loading-state">
                            <div className="loading-spinner"></div>
                            <p>Yükleniyor...</p>
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    return (
        <div className="modern-app">
            <ModernHeader user={user} onLogout={onLogout} />
            
            <div className="modern-layout">
                <Sidebar user={user} />
                
                <main className="modern-main">
                    <div className="home-page">
                        <div className="welcome-section">
                            <h1 className="welcome-title">
                                Hoş geldin, {user?.username || 'Kullanıcı'}! 👋
                            </h1>
                            <p className="welcome-subtitle">
                                Görevlerinizi organize edin ve takımınızla işbirliği yapın
                            </p>
                        </div>

                        {error && <div className="error-message">{error}</div>}

                        <div className="home-sections">
                            {/* Son Görüntülenenler */}
                            <div className="home-section">
                                <div className="section-header">
                                    <div className="section-icon">🕒</div>
                                    <h2 className="section-title">Son Görüntülenenler</h2>
                                </div>
                                
                                {recentBoards.length > 0 ? (
                                    <div className="boards-grid">
                                        {recentBoards.map((board) => (
                                            <div 
                                                key={board.id} 
                                                className="board-card"
                                                onClick={() => handleBoardClick(board.id)}
                                            >
                                                <div className="board-card-image">
                                                    <div className="board-gradient"></div>
                                                </div>
                                                <div className="board-card-content">
                                                    <h3 className="board-title">{board.name}</h3>
                                                    <p className="board-description">
                                                        {board.description || 'Açıklama yok'}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="empty-state">
                                        <div className="empty-icon">📋</div>
                                        <h3>Henüz pano yok</h3>
                                        <p>İlk panonuzu oluşturmak için "Panolar" sekmesine gidin</p>
                                        <button 
                                            className="btn btn-primary"
                                            onClick={() => navigate('/dashboard')}
                                        >
                                            Panolar'a Git
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Hızlı Erişim */}
                            <div className="home-section">
                                <div className="section-header">
                                    <div className="section-icon">⚡</div>
                                    <h2 className="section-title">Hızlı Erişim</h2>
                                </div>
                                
                                <div className="quick-actions">
                                    <button 
                                        className="quick-action-card"
                                        onClick={() => navigate('/dashboard')}
                                    >
                                        <div className="quick-action-icon">📋</div>
                                        <h3>Panolar</h3>
                                        <p>Tüm panolarınızı görüntüleyin</p>
                                    </button>
                                    
                                    <button 
                                        className="quick-action-card"
                                        onClick={() => {
                                            // Yeni pano oluşturma modal'ı açılacak
                                            navigate('/dashboard');
                                        }}
                                    >
                                        <div className="quick-action-icon">➕</div>
                                        <h3>Yeni Pano</h3>
                                        <p>Yeni bir çalışma alanı oluşturun</p>
                                    </button>
                                </div>
                            </div>

                            {/* İstatistikler */}
                            <div className="home-section">
                                <div className="section-header">
                                    <div className="section-icon">📊</div>
                                    <h2 className="section-title">İstatistikler</h2>
                                </div>
                                
                                <div className="stats-grid">
                                    <div className="stat-card">
                                        <div className="stat-number">{recentBoards.length}</div>
                                        <div className="stat-label">Toplam Pano</div>
                                    </div>
                                    
                                    <div className="stat-card">
                                        <div className="stat-number">0</div>
                                        <div className="stat-label">Tamamlanan Görev</div>
                                    </div>
                                    
                                    <div className="stat-card">
                                        <div className="stat-number">0</div>
                                        <div className="stat-label">Devam Eden Görev</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Home;