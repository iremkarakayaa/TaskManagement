import React, { useState, useEffect, useRef } from 'react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import Card from './Card';

const List = ({ 
    list, 
    index, 
    onEditList, 
    onDeleteList, 
    onAddCard, 
    onEditCard, 
    onDeleteCard, 
    onCardClick 
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState(list.name);
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef(null);

    // Menü dışına tıklandığında kapat
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowMenu(false);
            }
        };

        if (showMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showMenu]);



    const handleEditList = () => {
        if (editName.trim() && editName !== list.name) {
            onEditList(list.id, { name: editName.trim() });
        }
        setIsEditing(false);
    };

    const handleCancelEdit = () => {
        setEditName(list.name);
        setIsEditing(false);
    };

    const getCardCount = () => list.cards?.length || 0;
    const getCompletedCount = () => list.cards?.filter(card => card.isCompleted).length || 0;

    return (
        <Draggable draggableId={list.id.toString()} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={`list-container ${snapshot.isDragging ? 'dragging' : ''}`}
                >
                    {/* Liste Başlığı */}
                    <div className="list-header" {...provided.dragHandleProps}>
                        <div className="list-title-section">
                            {isEditing ? (
                                <div className="list-edit-form">
                                    <input
                                        type="text"
                                        className="list-edit-input"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleEditList()}
                                        onBlur={handleEditList}
                                        autoFocus
                                    />
                                    <div className="list-edit-actions">
                                        <button 
                                            className="btn btn-sm btn-primary"
                                            onClick={handleEditList}
                                        >
                                            ✓
                                        </button>
                                        <button 
                                            className="btn btn-sm btn-secondary"
                                            onClick={handleCancelEdit}
                                        >
                                            ✗
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <h3 className="list-title" onDoubleClick={() => setIsEditing(true)} title="Başlığı düzenlemek için çift tıklayın">
                                    {list.name}
                                </h3>
                            )}
                        </div>

                        {/* Liste İstatistikleri kaldırıldı */}

                        {/* Liste Aksiyonları */}
                        <div className="list-actions">
                            <div className="list-menu-container" ref={menuRef}>
                                <button
                                    className="btn btn-sm btn-menu"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowMenu(!showMenu);
                                    }}
                                    title="Liste Seçenekleri"
                                >
                                    ⋯
                                </button>
                                
                                {showMenu && (
                                    <div className="list-menu-dropdown">
                                        <button
                                            className="list-menu-item delete-item"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDeleteList(list.id);
                                                setShowMenu(false);
                                            }}
                                        >
                                            🗑️ Listeyi Sil
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>



                    {/* Kartlar */}
                    <Droppable droppableId={list.id.toString()} type="card" isDropDisabled={false} isCombineEnabled={false} ignoreContainerClipping={true}>
                        {(provided, snapshot) => (
                            <div
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                className={`list-cards ${snapshot.isDraggingOver ? 'drag-over' : ''}`}
                            >
                                {list.cards && list.cards.length > 0 && (
                                    list.cards.map((card, cardIndex) => (
                                        <Card
                                            key={card.id}
                                            card={card}
                                            index={cardIndex}
                                            onEdit={onEditCard}
                                            onDelete={onDeleteCard}
                                            onClick={onCardClick}
                                        />
                                    ))
                                )}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>

                    {/* Kart Ekleme Butonu */}
                    <button
                        className="add-card-btn"
                        onClick={() => onAddCard(list.id)}
                    >
                        + Kart Ekle
                    </button>
                </div>
            )}
        </Draggable>
    );
};

export default List;

