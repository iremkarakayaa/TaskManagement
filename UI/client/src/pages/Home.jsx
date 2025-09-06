import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import "../styles/Home.css";
import axios from "axios";

export default function Home({ user }) {
    const [lists, setLists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [profileOpen, setProfileOpen] = useState(false);
    const [newCardTitles, setNewCardTitles] = useState({}); // Her liste için input state

    // Backend API URL
    const API_BASE = "http://localhost:5035/api";

    // Backend'den board + list + card verisini çek
    useEffect(() => {
        async function fetchData() {
            try {
                const response = await axios.get(`${API_BASE}/boards`);
                // varsayalım ilk board'u gösteriyoruz
                const board = response.data[0];
                if (board && board.lists) {
                    setLists(board.lists.map(list => ({
                        ...list,
                        cards: list.cards || []
                    })));
                }
            } catch (err) {
                console.error("Veri çekilemedi:", err);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, []);

    // Kart ekleme
    const handleAddCard = async (listId) => {
        const title = newCardTitles[listId];
        if (!title) return;

        try {
            const response = await axios.post(`${API_BASE}/cards`, {
                listId,
                title,
                description: ""
            });

            const newCard = response.data;
            setLists(prev =>
                prev.map(list =>
                    list.id === listId
                        ? { ...list, cards: [...list.cards, newCard] }
                        : list
                )
            );
            setNewCardTitles(prev => ({ ...prev, [listId]: "" }));
        } catch (err) {
            console.error("Kart eklenemedi:", err);
        }
    };

    // Drag & Drop
    const handleDragEnd = async (result) => {
        const { source, destination } = result;
        if (!destination) return;
        if (
            source.droppableId === destination.droppableId &&
            source.index === destination.index
        ) return;

        const sourceList = lists.find(l => l.id === source.droppableId);
        const destList = lists.find(l => l.id === destination.droppableId);
        const [movedCard] = sourceList.cards.splice(source.index, 1);
        destList.cards.splice(destination.index, 0, movedCard);

        setLists([...lists]);

        // Backend'e taşıma bilgisini gönder
        try {
            await axios.put(`${API_BASE}/cards/${movedCard.id}/move`, {
                listId: destList.id,
                order: destination.index
            });
        } catch (err) {
            console.error("Kart taşınamadı:", err);
        }
    };

    if (loading) return <div>Yükleniyor...</div>;

    return (
        <div className="home-container">
            {/* Navbar */}
            <nav className="navbar">
                <div className="logo">TaskManager</div>
                <div className="nav-links">
                    <a href="/">Ana Sayfa</a>
                    <a href="/login">Login</a>
                    <a href="/register">Register</a>
                </div>
                <div className="profile" onClick={() => setProfileOpen(!profileOpen)}>
                    <div className="avatar">{user?.username?.slice(0, 2).toUpperCase()}</div>
                    {profileOpen && (
                        <div className="profile-dropdown">
                            <a href="/profile">Profil</a>
                            <a href="/settings">Ayarlar</a>
                            <a href="/logout">Çıkış</a>
                        </div>
                    )}
                </div>
            </nav>

            <h2 className="home-title">Görev Panosu</h2>

            <DragDropContext onDragEnd={handleDragEnd}>
                <div className="board-wrapper">
                    <div className="board">
                        {lists.map(list => (
                            <Droppable droppableId={list.id} key={list.id}>
                                {(provided) => (
                                    <div
                                        className="list"
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                    >
                                        <div className="list-header">
                                            <span className="list-title">{list.name}</span>
                                        </div>

                                        {list.cards.map((card, index) => (
                                            <Draggable
                                                draggableId={card.id.toString()}
                                                index={index}
                                                key={card.id}
                                            >
                                                {(provided, snapshot) => (
                                                    <div
                                                        className={`card ${snapshot.isDragging ? "dragging" : ""}`}
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                    >
                                                        <div className="card-title">{card.title}</div>
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}

                                        {/* Yeni kart ekleme */}
                                        <div className="add-card">
                                            <input
                                                placeholder="Yeni kart ekle..."
                                                value={newCardTitles[list.id] || ""}
                                                onChange={(e) =>
                                                    setNewCardTitles(prev => ({
                                                        ...prev,
                                                        [list.id]: e.target.value
                                                    }))
                                                }
                                            />
                                            <button onClick={() => handleAddCard(list.id)}>Ekle</button>
                                        </div>
                                    </div>
                                )}
                            </Droppable>
                        ))}

                        {/* Yeni liste ekleme */}
                        <div className="add-list">+ Liste Ekle</div>
                    </div>
                </div>
            </DragDropContext>
        </div>
    );
}
