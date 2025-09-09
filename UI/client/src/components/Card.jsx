import React from 'react';
import { Draggable } from 'react-beautiful-dnd';

const Card = ({ card, index, onEdit, onDelete, onClick }) => {

    // Düzenleme ve silme butonları kaldırıldı

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return '#ff4757';
            case 'medium': return '#ffa502';
            case 'low': return '#2ed573';
            default: return '#747d8c';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return '#2ed573';
            case 'in-progress': return '#3742fa';
            case 'pending': return '#ffa502';
            default: return '#747d8c';
        }
    };

    // Checklist
    const normalizedChecklist = Array.isArray(card.checklist)
        ? card.checklist
        : (card.checklist ? [] : []);
    const completedCount = normalizedChecklist.filter(item => item && item.completed).length;

    return (
        <Draggable draggableId={card.id.toString()} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={`card-item ${snapshot.isDragging ? 'dragging' : ''}`}
                    onClick={() => onClick(card)}
                >
                    {/* Kart Başlığı */}
                    <div className="card-header" {...provided.dragHandleProps}>
                        <h4
                            className="card-title"
                            role="button"
                            tabIndex={0}
                            onClick={() => onClick(card)}
                            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick(card)}
                        >
                            {card.title}
                        </h4>
                    </div>

                    {/* Trello benzeri: listede sadece başlık */}
                </div>
            )}
        </Draggable>
    );
};

export default Card;

