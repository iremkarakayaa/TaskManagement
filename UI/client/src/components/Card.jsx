import React, { useState } from 'react';
import { Draggable } from 'react-beautiful-dnd';

const Card = ({ card, index, onEdit, onDelete, onClick }) => {
    const [showActions, setShowActions] = useState(false);

    const handleEdit = (e) => {
        e.stopPropagation();
        onEdit(card);
    };

    const handleDelete = (e) => {
        e.stopPropagation();
        if (window.confirm('Bu kartı silmek istediğinizden emin misiniz?')) {
            onDelete(card.id);
        }
    };

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

    return (
        <Draggable draggableId={card.id.toString()} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`card-item ${snapshot.isDragging ? 'dragging' : ''}`}
                    onClick={() => onClick(card)}
                    onMouseEnter={() => setShowActions(true)}
                    onMouseLeave={() => setShowActions(false)}
                >
                    {/* Kart Başlığı */}
                    <div className="card-header">
                        <h4 className="card-title">{card.title}</h4>
                        {showActions && (
                            <div className="card-actions">
                                <button
                                    className="card-action-btn edit-btn"
                                    onClick={handleEdit}
                                    title="Düzenle"
                                >
                                    ✏️
                                </button>
                                <button
                                    className="card-action-btn delete-btn"
                                    onClick={handleDelete}
                                    title="Sil"
                                >
                                    🗑️
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Kart Açıklaması */}
                    {card.description && (
                        <div className="card-description">
                            <p>{card.description.length > 100 
                                ? `${card.description.substring(0, 100)}...` 
                                : card.description}
                            </p>
                        </div>
                    )}

                    {/* Kart Meta Bilgileri */}
                    <div className="card-meta">
                        {/* Kontrol Listesi İlerlemesi */}
                        {card.checklist && card.checklist.length > 0 && (
                            <div className="card-checklist-progress">
                                <div className="checklist-progress-bar">
                                    <div 
                                        className="checklist-progress-fill" 
                                        style={{ 
                                            width: `${(card.checklist.filter(item => item.completed).length / card.checklist.length) * 100}%` 
                                        }}
                                    ></div>
                                </div>
                                <span className="checklist-progress-text">
                                    {card.checklist.filter(item => item.completed).length}/{card.checklist.length}
                                </span>
                            </div>
                        )}

                        {/* Etiketler */}
                        {card.labels && card.labels.length > 0 && (
                            <div className="card-labels">
                                {card.labels.slice(0, 3).map((label, idx) => (
                                    <span key={idx} className="card-label">
                                        {label}
                                    </span>
                                ))}
                                {card.labels.length > 3 && (
                                    <span className="card-label-more">
                                        +{card.labels.length - 3}
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Atanan Kullanıcı */}
                        {card.assignedUser && (
                            <div className="card-assignee">
                                <span className="assignee-avatar">
                                    {card.assignedUser.username?.charAt(0).toUpperCase() || 'U'}
                                </span>
                                <span className="assignee-name">
                                    {card.assignedUser.username}
                                </span>
                            </div>
                        )}

                        {/* Teslim Tarihi */}
                        {card.dueDate && (
                            <div className={`card-due-date ${new Date(card.dueDate) < new Date() ? 'overdue' : ''}`}>
                                📅 {new Date(card.dueDate).toLocaleDateString('tr-TR')}
                            </div>
                        )}

                        {/* Öncelik */}
                        {card.priority && (
                            <div className="card-priority">
                                <span 
                                    className="priority-indicator"
                                    style={{ backgroundColor: getPriorityColor(card.priority) }}
                                ></span>
                                {card.priority}
                            </div>
                        )}

                        {/* Durum */}
                        {card.status && (
                            <div className="card-status">
                                <span 
                                    className="status-indicator"
                                    style={{ backgroundColor: getStatusColor(card.status) }}
                                ></span>
                                {card.status}
                            </div>
                        )}
                    </div>

                    {/* Kart Alt Bilgileri */}
                    <div className="card-footer">
                        {/* Kontrol Listesi İlerlemesi */}
                        {card.checklist && card.checklist.length > 0 && (
                            <div className="card-checklist">
                                ✅ {card.checklist.filter(item => item.completed).length}/{card.checklist.length}
                            </div>
                        )}

                        {/* Yorum Sayısı */}
                        {card.comments && card.comments.length > 0 && (
                            <div className="card-comments">
                                💬 {card.comments.length}
                            </div>
                        )}

                        {/* Ek Dosya Sayısı */}
                        {card.attachments && card.attachments.length > 0 && (
                            <div className="card-attachments">
                                📎 {card.attachments.length}
                            </div>
                        )}

                        {/* Oluşturulma Tarihi */}
                        <div className="card-created">
                            {new Date(card.createdAt).toLocaleDateString('tr-TR')}
                        </div>
                    </div>
                </div>
            )}
        </Draggable>
    );
};

export default Card;

