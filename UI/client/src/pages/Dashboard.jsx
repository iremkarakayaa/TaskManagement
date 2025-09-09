import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
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
            <div className="app">
                <Header user={user} onLogout={onLogout} />
                <div className="loading">Panolar yükleniyor...</div>
            </div>
        );
    }

    return (
        <div className="app">
            <Header user={user} onLogout={onLogout} />

            <div className="dashboard">
                <div className="container">
                    <div className="dashboard-header">
                        <h1 className="dashboard-title">Hoş geldin, {user?.username || 'Kullanıcı'}!</h1>
                        <p className="dashboard-subtitle">Görevlerini organize et ve takımınla işbirliği yap</p>
                    </div>

                    {error && <div className="error">{error}</div>}

                    <div className="boards-grid">
                        {boards.map((board) => (
                            <div
                                key={board.id}
                                className="board-card"
                                onClick={() => handleBoardClick(board.id)}
                            >
                                <h3>{board.name}</h3>
                                {board.createdAt && (
                                    <p>Oluşturulma: {new Date(board.createdAt).toLocaleDateString('tr-TR')}</p>
                                )}
                                {board.description && <p>{board.description}</p>}
                            </div>
                        ))}

                        <div
                            className="board-card create-board-card"
                            onClick={() => setShowCreateModal(true)}
                        >
                            <div className="create-board-icon">+</div>
                            <h3>Yeni Pano Oluştur</h3>
                            <p>Yeni bir proje veya görev grubu başlat</p>
                        </div>
                    </div>
                </div>
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
