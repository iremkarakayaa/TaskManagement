import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import axios from 'axios';
import Header from '../components/Header';
import List from '../components/List';
import CreateListModal from '../components/CreateListModal';
import CreateCardModal from '../components/CreateCardModal';
import CardDetailModal from '../components/CardDetailModal';

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

    const API_BASE = "http://localhost:5035/api";

    useEffect(() => {
        fetchBoardData();
    }, [boardId]);

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
            setError(null); // Önceki hatayı temizle
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
            const response = await axios.put(`${API_BASE}/cards/${card.id}`, card);
            const updatedCard = response.data;

            setLists(lists.map(list =>
                list.id === updatedCard.listId
                    ? { ...list, cards: (list.cards || []).map(c => c.id === updatedCard.id ? updatedCard : c) }
                    : list
            ));
        } catch (err) {
            setError('Kart güncellenirken bir hata oluştu.');
            console.error(err);
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

    if (loading) return <div className="app"><Header user={user} onLogout={onLogout} /><div className="loading">Pano yükleniyor...</div></div>;
    if (error) return <div className="app"><Header user={user} onLogout={onLogout} /><div className="error">{error}</div></div>;

    return (
        <div className="app">
            <Header user={user} onLogout={onLogout} />

            <div className="board-page">
                <div className="board-header-bar board-header-minimal">
                    <h1 className="board-title-only">{board?.name}</h1>
                </div>
                
                <div className="container">
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
            </div>

            {showCreateListModal && <CreateListModal onClose={() => setShowCreateListModal(false)} onSubmit={handleCreateList} />}
            {showCreateCardModal && <CreateCardModal onClose={() => { setShowCreateCardModal(false); setSelectedListForCard(null); }} onSubmit={(data) => handleCreateCard(selectedListForCard, data)} />}
            {selectedCard && <CardDetailModal card={selectedCard} onClose={() => setSelectedCard(null)} onUpdate={handleEditCard} onDelete={(cardId) => { handleDeleteCard(cardId, selectedCard.listId); setSelectedCard(null); }} />}
        </div>
    );
};

export default Board;
