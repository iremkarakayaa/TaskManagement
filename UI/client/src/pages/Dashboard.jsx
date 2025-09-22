import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ModernHeader from '../components/ModernHeader';
import Sidebar from '../components/Sidebar';
import CreateBoardModal from '../components/CreateBoardModal';

const Dashboard = ({ user, onLogout }) => {
    const [boards, setBoards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const navigate = useNavigate();

    const API_BASE = "http://localhost:5035/api";

    useEffect(() => {
        testAPI();
        fetchBoards();
    }, []);

    // API test fonksiyonu
    const testAPI = async () => {
        try {
            const response = await axios.get(`${API_BASE}/boards/test`);
            console.log('API Test:', response.data);
        } catch (err) {
            console.error('API Test failed:', err);
        }
    };

    // Kullanıcının panolarını çek (sahip olduğu + üye olduğu)
    const fetchBoards = async () => {
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
            
            setBoards(allBoards);
            setError(null);
        } catch (err) {
            setError('Panolar yüklenirken bir hata oluştu.');
            console.error('Error fetching boards:', err);
        } finally {
            setLoading(false);
        }
    };

    // Yeni board oluştur
    const handleCreateBoard = async (boardData) => {
        try {
            console.log('Creating board with data:', {
                name: boardData.title,
                description: boardData.description || "",
                ownerUserId: user?.id || 1
            });

            const response = await axios.post(`${API_BASE}/boards`, {
                name: boardData.title,
                description: boardData.description || "",
                ownerUserId: user?.id || 1   // Gerçek kullanıcı ID'si kullan
            });

            console.log('Board created successfully:', response.data);
            const newBoard = response.data;
            setBoards(prev => [...prev, newBoard]);
            setShowCreateModal(false);
            setError(null); // Önceki hatayı temizle
        } catch (err) {
            // Hata detaylarını konsola yazdır
            console.error('Error creating board:', err);
            console.error('Error response:', err.response);
            console.error('Error data:', err.response?.data);
            setError(err.response?.data?.message || 'Pano oluşturulurken bir hata oluştu.');
        }
    };


    // Board'a tıklandığında yönlendir
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
                            <p>Panolar yükleniyor...</p>
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
                    <div className="boards-page">
                        <div className="page-header">
                            <div className="page-title-section">
                                <h1 className="page-title">Panolar</h1>
                                <p className="page-subtitle">Çalışma alanlarınızı organize edin</p>
                            </div>
                            <button 
                                className="btn btn-primary btn-create"
                                onClick={() => setShowCreateModal(true)}
                            >
                                <span className="btn-icon">+</span>
                                Yeni Pano
                            </button>
                        </div>

                        {error && <div className="error-message">{error}</div>}

                        <div className="boards-section">
                            <div className="section-header">
                                <h2 className="section-title">Son Görüntülenenler</h2>
                            </div>
                            
                            <div className="boards-grid">
                                {boards.map((board) => (
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
                                            <div className="board-meta">
                                                <span className="board-stats">
                                                    📋 {board.lists?.length || 0} liste
                                                </span>
                                            </div>
                                        </div>
                                        <div className="board-card-actions">
                                            <button 
                                                className="board-action-btn"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    // Board actions
                                                }}
                                            >
                                                ⋮
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                
                                {/* Yeni Pano Kartı */}
                                <div 
                                    className="board-card board-card-new"
                                    onClick={() => setShowCreateModal(true)}
                                >
                                    <div className="board-card-content">
                                        <div className="new-board-icon">+</div>
                                        <h3 className="board-title">Yeni pano oluştur</h3>
                                        <p className="board-description">Yeni bir çalışma alanı başlatın</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {showCreateModal && (
                <CreateBoardModal
                    onClose={() => setShowCreateModal(false)}
                    onSubmit={handleCreateBoard}
                />
            )}
        </div>
    );
};

export default Dashboard;
