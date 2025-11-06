import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import axios from 'axios';
import ModernHeader from '../components/ModernHeader';
import List from '../components/List';
import CreateListModal from '../components/CreateListModal';
import CreateCardModal from '../components/CreateCardModal';
import CardDetailModal from '../components/CardDetailModal';
import ModernCardDetailModal from '../components/ModernCardDetailModal';
import BoardCollaborationModal from '../components/BoardCollaborationModal';

const Board = ({ user, onLogout }) => {
    const { boardId } = useParams();
    

    const [board, setBoard] = useState(null);
    const [lists, setLists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCreateListModal, setShowCreateListModal] = useState(false);
    const [showCreateCardModal, setShowCreateCardModal] = useState(false);
    const [selectedCard, setSelectedCard] = useState(null);
    const [selectedListForCard, setSelectedListForCard] = useState(null);
    const [newlyCreatedCard, setNewlyCreatedCard] = useState(null);
    const [showCollaborationModal, setShowCollaborationModal] = useState(false);
    const [userBoards, setUserBoards] = useState([]);
    const [showBoardSwitcher, setShowBoardSwitcher] = useState(false);

    const API_BASE = "http://localhost:5035/api";

    useEffect(() => {
        fetchBoardData();
        fetchUserBoards();
    }, [boardId, user?.id]);

    // Board ve listeleri getir
    const fetchBoardData = async () => {
        try {
            setLoading(true);
            const [boardData, listsData] = await Promise.all([
                axios.get(`${API_BASE}/boards/${boardId}`).then(res => res.data),
                axios.get(`${API_BASE}/lists/board/${boardId}`).then(res => res.data)
            ]);

            if (!boardData) {
                setError('Pano bulunamadı.');
                return;
            }

            setBoard(boardData);
            setLists(listsData.sort((a, b) => a.order - b.order));
            setError(null);
        } catch (err) {
            setError('Pano verileri yüklenirken bir hata oluştu.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Kullanıcının panolarını getir
    const fetchUserBoards = async () => {
        if (!user?.id) return;
        
        try {
            const [ownedBoards, memberBoards] = await Promise.all([
                axios.get(`${API_BASE}/boards/user/${user.id}`).then(res => res.data),
                axios.get(`${API_BASE}/boardcollaboration/user/${user.id}/boards`).then(res => res.data)
            ]);

            // Panoları birleştir ve tekrarları kaldır
            const allBoards = [...ownedBoards, ...memberBoards];
            const uniqueBoards = allBoards.filter((board, index, self) => 
                index === self.findIndex(b => b.id === board.id)
            );
            
            setUserBoards(uniqueBoards);
        } catch (err) {
            console.error('Kullanıcı panoları yüklenirken hata:', err);
        }
    };

    // Yeni liste oluştur
    const handleCreateList = async (listData) => {
        try {
            const response = await axios.post(`${API_BASE}/lists`, {
                boardId: parseInt(boardId),
                name: listData.name,
                order: lists.length
            });
            setLists([...lists, response.data]);
            setShowCreateListModal(false);
        } catch (err) {
            setError('Liste oluşturulurken bir hata oluştu.');
            console.error(err);
        }
    };

    // Yeni kart oluştur
    const handleCreateCard = async (listId, cardData) => {
        try {
            if (!listId || isNaN(parseInt(listId))) {
                console.error('Invalid listId:', listId);
                setError('Geçersiz liste ID');
                return;
            }

            const parsedListId = parseInt(listId);
            console.log('Creating card with data:', {
                listId: parsedListId,
                title: cardData.title,
                description: cardData.description || '',
                dueDate: cardData.dueDate || null,
                isCompleted: cardData.isCompleted || false,
                checklist: cardData.checklist || []
            });

            const response = await axios.post(`${API_BASE}/cards`, {
                listId: parsedListId,
                title: cardData.title,
                description: cardData.description || '',
                dueDate: cardData.dueDate || null,
                isCompleted: cardData.isCompleted || false,
                checklist: cardData.checklist || []
            });

            console.log('Card created successfully:', response.data);

            setLists(lists.map(list =>
                list.id === parseInt(listId)
                    ? { ...list, cards: [...(list.cards || []), response.data] }
                    : list
            ));
            
            // Close the create card modal
            setShowCreateCardModal(false);
            setSelectedListForCard(null);
            setError(null); // Önceki hatayı temizle
            
            console.log('Card created successfully and modal closed');
        } catch (err) {
            console.error('Error creating card:', err);
            console.error('Error response:', err.response);
            console.error('Error data:', err.response?.data);
            setError(err.response?.data?.message || 'Kart oluşturulurken bir hata oluştu.');
        }
    };

    // Kart güncelle
    const handleEditCard = async (card) => {
        try {
            console.log('handleEditCard çağrıldı:', card);
            
            // Explicitly construct the payload to avoid model binding conflicts
            const payload = {
                id: card.id,
                title: card.title,
                description: card.description || '',
                dueDate: card.dueDate,
                IsCompleted: card.IsCompleted !== undefined ? card.IsCompleted : card.isCompleted,
                listId: card.listId,
                checklist: card.checklist || '[]',
                assignedUserId: card.assignedUserId || null
            };
            
            console.log('Gönderilen payload:', JSON.stringify(payload, null, 2));
            const response = await axios.put(`${API_BASE}/cards/${card.id}`, payload);
            console.log('API response:', response.data);
            const updatedCard = response.data;
            
            // Backend'den gelen IsCompleted'i normalize et (hem IsCompleted hem isCompleted olabilir)
            const normalizedCard = {
                ...updatedCard,
                IsCompleted: updatedCard.IsCompleted !== undefined ? updatedCard.IsCompleted : updatedCard.isCompleted,
                isCompleted: updatedCard.IsCompleted !== undefined ? updatedCard.IsCompleted : updatedCard.isCompleted
            };

            setLists(lists.map(list =>
                list.id === normalizedCard.listId
                    ? { ...list, cards: (list.cards || []).map(c => c.id === normalizedCard.id ? normalizedCard : c) }
                    : list
            ));
            console.log('Kart başarıyla güncellendi');
        } catch (err) {
            console.error('Kart güncellenirken bir hata oluştu:', err);
            console.error('Error response:', err.response?.data);
            console.log('Error response data:', JSON.stringify(err.response?.data, null, 2));
            console.error('Error status:', err.response?.status);
            console.error('Error message:', err.message);
            console.error('Full error:', JSON.stringify(err, null, 2));
            // Error state'i set etmiyoruz, sadece console'a yazdırıyoruz
        }
    };

    // Liste güncelle
    const handleEditList = async (listId, listData) => {
        try {
            const response = await axios.put(`${API_BASE}/lists/${listId}`, listData);
            const updatedList = response.data;

            setLists(lists.map(list =>
                list.id === listId ? { ...list, ...updatedList } : list
            ));
        } catch (err) {
            setError('Liste güncellenirken bir hata oluştu.');
            console.error(err);
        }
    };

    // Drag & drop işlemi
    const handleDragEnd = async (result) => {
        if (!result.destination) return;

        const { source, destination, type } = result;

        if (type === 'list') {
            // Liste sıralaması değiştirme
            const newLists = Array.from(lists);
            const [removed] = newLists.splice(source.index, 1);
            newLists.splice(destination.index, 0, removed);

            const updatedLists = newLists.map((list, index) => ({ ...list, order: index }));
            setLists(updatedLists);

            try {
                await Promise.all(updatedLists.map(list => 
                    axios.put(`${API_BASE}/lists/${list.id}`, { 
                        name: list.name, 
                        order: list.order 
                    })
                ));
            } catch (err) {
                console.error('Error updating list order:', err);
                fetchBoardData();
            }
        } else if (type === 'card') {
            // Kart taşıma
            const sourceList = lists.find(list => list.id == source.droppableId);
            const destList = lists.find(list => list.id == destination.droppableId);
            
            if (!sourceList || !destList) return;

            const sourceCards = Array.from(sourceList.cards || []);
            const destCards = Array.from(destList.cards || []);
            const [removed] = sourceCards.splice(source.index, 1);

            // Kartı yeni listeye ekle
            if (source.droppableId === destination.droppableId) {
                // Aynı liste içinde taşıma
                destCards.splice(destination.index, 0, removed);
            } else {
                // Farklı listeye taşıma
                destCards.splice(destination.index, 0, removed);
            }

            // State'i güncelle
            const newLists = lists.map(list => {
                if (list.id == sourceList.id) return { ...list, cards: sourceCards };
                if (list.id == destList.id) return { ...list, cards: destCards };
                return list;
            });
            setLists(newLists);

            try {
                // Backend'e kart taşıma isteği gönder
                await axios.put(`${API_BASE}/cards/${removed.id}/move`, { 
                    listId: parseInt(destination.droppableId), 
                    order: destination.index 
                });
                console.log(`Card ${removed.id} moved to list ${destination.droppableId}`);
            } catch (err) {
                console.error('Error moving card:', err);
                // Hata durumunda verileri yeniden yükle
                fetchBoardData();
            }
        }
    };

    // Liste sil
    const handleDeleteList = async (listId) => {
        try {
            await axios.delete(`${API_BASE}/lists/${listId}`);
            setLists(lists.filter(list => list.id !== listId));
        } catch (err) {
            setError('Liste silinirken bir hata oluştu.');
            console.error(err);
        }
    };

    // Kart sil
    const handleDeleteCard = async (cardId, listId) => {
        try {
            await axios.delete(`${API_BASE}/cards/${cardId}`);
            setLists(lists.map(list =>
                list.id === listId
                    ? { ...list, cards: (list.cards || []).filter(c => c.id !== cardId) }
                    : list
            ));
        } catch (err) {
            setError('Kart silinirken bir hata oluştu.');
            console.error(err);
        }
    };

    if (loading) return <div className="app"><ModernHeader user={user} onLogout={onLogout} /><div className="loading">Pano yükleniyor...</div></div>;
    if (error) return <div className="app"><ModernHeader user={user} onLogout={onLogout} /><div className="error">{error}</div></div>;

    return (
        <div className="app">
            <ModernHeader user={user} onLogout={onLogout} />

            <div className="board-page">
                {/* İkinci Header - Pano İsmi ve İşbirliği */}
                <div className="board-sub-header">
                    <div className="board-sub-header-content">
                        <div className="board-title-section">
                            <h1 className="board-name">{board?.name}</h1>
                        </div>
                        <div className="board-actions-section">
                            <button 
                                className="btn btn-collaboration"
                                onClick={() => setShowCollaborationModal(true)}
                            >
                                <svg className="collaboration-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                                    <circle cx="9" cy="7" r="4"/>
                                    <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                                </svg>
                                İşbirliği
                            </button>
                        </div>
                    </div>
                </div>
                
                <div className="board-container">
                    {board?.description && (
                        <div className="board-description">
                            <p>{board.description}</p>
                        </div>
                    )}

                    <DragDropContext onDragEnd={handleDragEnd}>
                        <Droppable droppableId="lists" direction="horizontal" type="list" isDropDisabled={false} isCombineEnabled={false}>
                            {(provided) => (
                                <div className="board-lists" ref={provided.innerRef} {...provided.droppableProps}>
                                    {lists.map((list, index) => (
                                        <List
                                            key={list.id}
                                            list={list}
                                            index={index}
                                            onEditList={handleEditList}
                                            onDeleteList={handleDeleteList}
                                            onAddCard={(listId) => {
                                                setSelectedListForCard(listId);
                                                setShowCreateCardModal(true);
                                            }}
                                            onEditCard={handleEditCard}
                                            onDeleteCard={handleDeleteCard}
                                            onCardClick={setSelectedCard}
                                        />
                                    ))}
                                    {provided.placeholder}

                                    <div className="list-container">
                                        <button className="add-card-btn" onClick={() => setShowCreateListModal(true)}>
                                            + Yeni Liste Ekle
                                        </button>
                                    </div>
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>
                </div>

                {/* Panoları Değiştir Butonu */}
                <div className="board-switcher">
                    <button 
                        className="btn btn-board-switcher"
                        onClick={() => setShowBoardSwitcher(!showBoardSwitcher)}
                    >
                        📋 Panoları Değiştir
                    </button>
                    
                    {showBoardSwitcher && (
                        <div className="board-switcher-dropdown">
                            {userBoards.map(boardItem => (
                                <button
                                    key={boardItem.id}
                                    className={`board-switcher-item ${boardItem.id === parseInt(boardId) ? 'active' : ''}`}
                                    onClick={() => {
                                        window.location.href = `/board/${boardItem.id}`;
                                    }}
                                >
                                    {boardItem.name}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {showCreateListModal && <CreateListModal onClose={() => setShowCreateListModal(false)} onSubmit={handleCreateList} />}
            {showCreateCardModal && <ModernCardDetailModal boardId={parseInt(boardId)} card={{ title: '', description: '', listId: selectedListForCard, isNew: true }} onClose={() => { setShowCreateCardModal(false); setSelectedListForCard(null); }} onUpdate={(data) => handleCreateCard(selectedListForCard, data)} onDelete={() => {}} />}
            {selectedCard && <ModernCardDetailModal boardId={parseInt(boardId)} card={selectedCard} onClose={() => setSelectedCard(null)} onUpdate={handleEditCard} onDelete={(cardId) => { handleDeleteCard(cardId, selectedCard.listId); setSelectedCard(null); }} />}
            {newlyCreatedCard && <ModernCardDetailModal boardId={parseInt(boardId)} card={newlyCreatedCard} onClose={() => setNewlyCreatedCard(null)} onUpdate={handleEditCard} onDelete={(cardId) => { handleDeleteCard(cardId, newlyCreatedCard.listId); setNewlyCreatedCard(null); }} />}
            {showCollaborationModal && <BoardCollaborationModal boardId={boardId} onClose={() => setShowCollaborationModal(false)} />}
        </div>
    );
};

export default Board;
