import React, { useState } from 'react';
import { Draggable } from 'react-beautiful-dnd';

const Card = ({ card, index, boardMembers = [], onEdit, onDelete, onClick }) => {
    const [showActions, setShowActions] = useState(false);

    // Atanmış kullanıcıları belirle
    const getAssignedUsers = () => {
        let assignedIds = [];
        try {
            if (Array.isArray(card.assignedUserIds)) {
                assignedIds = card.assignedUserIds;
            } else if (typeof card.assignedUserIds === 'string') {
                assignedIds = JSON.parse(card.assignedUserIds || '[]');
            }
        } catch (e) {
            console.error("Error parsing assignedUserIds:", e);
        }

        // boardMembers dizisindeki UserId veya Id alanına göre eşleştirme yap
        return boardMembers.filter(m => assignedIds.includes(m.userId) || assignedIds.includes(m.Id) || assignedIds.includes(m.id));
    };

    const assignedUsers = getAssignedUsers();

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

    // Kart tamamlandı mı kontrol et - hem IsCompleted hem isCompleted kontrol et
    const isCompleted = card.IsCompleted === true || card.isCompleted === true || card.status === 'completed';

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

                            {/* Atanmış Kullanıcılar */}
                            {assignedUsers.length > 0 && (
                                <div className="card-assigned-users">
                                    {assignedUsers.slice(0, 3).map(user => (
                                        <div 
                                            key={user.userId || user.id} 
                                            className="mini-avatar" 
                                            title={user.username}
                                        >
                                            {user.username?.charAt(0).toUpperCase()}
                                        </div>
                                    ))}
                                    {assignedUsers.length > 3 && (
                                        <div className="mini-avatar more">+{assignedUsers.length - 3}</div>
                                    )}
                                </div>
                            )}

                            {/* Öncelik/Durum göstergeleri istenmediği için kaldırıldı */}
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

