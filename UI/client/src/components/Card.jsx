import React, { useState } from 'react';
import { Draggable } from 'react-beautiful-dnd';

const Card = ({ card, index, onEdit, onDelete, onClick }) => {
    const [showActions, setShowActions] = useState(false);

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
    const totalChecklist = normalizedChecklist.length;

    // Açıklama var mı kontrol et
    const hasDescription = card.description && card.description.trim().length > 0;

    // Kart tamamlandı mı kontrol et
    const isCompleted = card.IsCompleted || card.isCompleted || card.status === 'completed';

    // Süre geçmişi kontrol et
    const isOverdue = card.dueDate && new Date(card.dueDate) < new Date() && !isCompleted;

    return (
        <Draggable draggableId={card.id.toString()} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={`modern-card ${snapshot.isDragging ? 'dragging' : ''} ${isCompleted ? 'completed' : ''}`}
                    onMouseEnter={() => setShowActions(true)}
                    onMouseLeave={() => setShowActions(false)}
                >
                    {/* Kart İçeriği */}
                    <div className="card-content" {...provided.dragHandleProps}>
                        {/* Kart Başlığı */}
                        <div className="card-title-section">
                            <div className="card-completion-checkbox">
                                <button 
                                    type="button"
                                    className={`completion-btn ${isCompleted ? 'completed' : ''}`}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        e.nativeEvent.stopImmediatePropagation();
                                        console.log('Checkbox tıklandı, isCompleted:', isCompleted, '->', !isCompleted);
                                        onEdit({ ...card, IsCompleted: !isCompleted });
                                    }}
                                    title={isCompleted ? "Tamamlanmadı olarak işaretle" : "Tamamlandı olarak işaretle"}
                                >
                                    {isCompleted && <span className="checkmark">✓</span>}
                                </button>
                            </div>
                            <h4 
                                className="card-title" 
                                onClick={() => onClick(card)}
                                style={{ cursor: 'pointer' }}
                            >
                                {card.title}
                            </h4>
                        </div>

                        {/* Kart Meta Bilgileri */}
                        <div className="card-meta">
                            {/* Açıklama Göstergesi */}
                            {hasDescription && (
                                <div className="card-description-indicator">
                                    <div className="description-lines">
                                        <div className="line"></div>
                                        <div className="line"></div>
                                        <div className="line"></div>
                                    </div>
                                </div>
                            )}

                            {/* Süre Geçmişi Göstergesi */}
                            {isOverdue && (
                                <div className="card-overdue-indicator">
                                    <span className="overdue-icon">🕐</span>
                                    <span className="overdue-text">
                                        {new Date(card.dueDate).toLocaleDateString('tr-TR', { 
                                            day: 'numeric', 
                                            month: 'short' 
                                        })}
                                    </span>
                                </div>
                            )}

                            {/* Checklist Göstergesi */}
                            {totalChecklist > 0 && (
                                <div className="card-checklist-indicator">
                                    <span className="checklist-icon">☑️</span>
                                    <span className="checklist-count">{completedCount}/{totalChecklist}</span>
                                </div>
                            )}

                            {/* Öncelik Göstergesi */}
                            {card.priority && (
                                <div 
                                    className="card-priority-indicator"
                                    style={{ backgroundColor: getPriorityColor(card.priority) }}
                                ></div>
                            )}

                            {/* Durum Göstergesi */}
                            {card.status && (
                                <div 
                                    className="card-status-indicator"
                                    style={{ backgroundColor: getStatusColor(card.status) }}
                                ></div>
                            )}
                        </div>
                    </div>

                    {/* Hover Actions - Artık sadece diğer aksiyonlar için */}
                    {showActions && (
                        <div className="card-hover-actions">
                            {/* Diğer hover aksiyonları buraya eklenebilir */}
                        </div>
                    )}
                </div>
            )}
        </Draggable>
    );
};

export default Card;

