import React, { useState, useEffect } from 'react';

const ModernCardDetailModal = ({ boardId, card, onClose, onUpdate, onDelete }) => {
    const [isEditing, setIsEditing] = useState(card.isNew || false);
    const [formData, setFormData] = useState({
        title: card.title || '',
        description: card.description || '',
        dueDate: card.dueDate ? card.dueDate.slice(0, 16) : '',
        priority: card.priority || 'medium',
        status: card.status || 'pending',
        labels: card.labels || [],
        assignedUserId: card.assignedUserId || null
    });
    const [newLabel, setNewLabel] = useState('');
    const [newComment, setNewComment] = useState('');
    const [newChecklistItem, setNewChecklistItem] = useState('');
    const [checklistItems, setChecklistItems] = useState([]);
    const [availableUsers, setAvailableUsers] = useState([]);
    const [comments, setComments] = useState([]);

    const API_BASE = "http://localhost:5035/api";

    useEffect(() => {
        setFormData({
            title: card.title || '',
            description: card.description || '',
            dueDate: card.dueDate ? card.dueDate.slice(0, 16) : '',
            priority: card.priority || 'medium',
            status: card.status || 'pending',
            labels: card.labels || [],
            assignedUserId: card.assignedUserId || null
        });
        
        if (!card.isNew) {
            fetchChecklistItems();
            fetchComments();
            fetchBoardMembers();
        } else {
            fetchBoardMembers(); // Yeni kart için sadece board members
        }
    }, [card]);

    const fetchChecklistItems = async () => {
        try {
            const response = await fetch(`${API_BASE}/checklistitems/${card.id}`);
            if (response.ok) {
                const items = await response.json();
                setChecklistItems(items);
            }
        } catch (err) {
            console.error('Error fetching checklist items:', err);
        }
    };

    const fetchComments = async () => {
        try {
            const response = await fetch(`${API_BASE}/cardcomments/${card.id}`);
            if (response.ok) {
                const comments = await response.json();
                setComments(comments);
            }
        } catch (err) {
            console.error('Error fetching comments:', err);
        }
    };

    const fetchBoardMembers = async () => {
        try {
            const response = await fetch(`${API_BASE}/boardcollaboration/${boardId}/members`);
            if (response.ok) {
                const members = await response.json();
                setAvailableUsers(members.map(m => m.user));
            }
        } catch (err) {
            console.error('Error fetching board members:', err);
        }
    };

    const handleSave = async () => {
        if (!formData.title || formData.title.trim().length === 0) {
            return;
        }
        if (card.isNew) {
            // Yeni kart oluştur
            const cardData = {
                title: formData.title.trim(),
                description: formData.description || '',
                dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
                priority: formData.priority,
                status: formData.status,
                labels: formData.labels,
                assignedUserId: formData.assignedUserId || null,
                checklist: []
            };
            onUpdate(cardData);
        } else {
            // Mevcut kartı güncelle - sadece API'nin beklediği alanlar
            const updatePayload = {
                id: card.id,
                listId: card.listId,
                title: formData.title.trim(),
                description: formData.description || '',
                dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
                priority: formData.priority,
                status: formData.status,
                labels: formData.labels,
                assignedUserId: formData.assignedUserId || null
            };
            onUpdate(updatePayload);
            setIsEditing(false);
        }
    };

    const handleAddChecklistItem = async () => {
        if (newChecklistItem.trim()) {
            try {
                const response = await fetch(`${API_BASE}/checklistitems`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        cardId: card.id,
                        text: newChecklistItem.trim()
                    })
                });

                if (response.ok) {
                    setNewChecklistItem('');
                    fetchChecklistItems();
                }
            } catch (err) {
                console.error('Error adding checklist item:', err);
            }
        }
    };

    const handleToggleChecklistItem = async (itemId, isCompleted) => {
        try {
            await fetch(`${API_BASE}/checklistitems/${itemId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isCompleted: !isCompleted })
            });
            fetchChecklistItems();
        } catch (err) {
            console.error('Error updating checklist item:', err);
        }
    };

    const handleAddComment = async () => {
        if (newComment.trim()) {
            try {
                const response = await fetch(`${API_BASE}/cardcomments`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        cardId: card.id,
                        userId: 1, // Şimdilik sabit
                        text: newComment.trim()
                    })
                });

                if (response.ok) {
                    setNewComment('');
                    fetchComments();
                }
            } catch (err) {
                console.error('Error adding comment:', err);
            }
        }
    };

    const handleUpdateAssignment = async (userId) => {
        try {
            const updatePayload = card.isNew ? null : {
                id: card.id,
                listId: card.listId,
                title: (formData.title ?? card.title ?? '').toString().trim(),
                description: formData.description ?? card.description ?? '',
                dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : (card.dueDate || null),
                priority: formData.priority || card.priority || 'medium',
                status: formData.status || card.status || 'pending',
                labels: (formData.labels && formData.labels.length ? formData.labels : (card.labels || [])),
                checklist: Array.isArray(card.checklist) ? card.checklist : [],
                isCompleted: card.isCompleted ?? false,
                assignedUserId: userId
            };
            setFormData(prev => ({ ...prev, assignedUserId: userId }));
            if (updatePayload) {
                onUpdate(updatePayload);
            }
        } catch (err) {
            console.error('Error updating assignment:', err);
        }
    };

    const completedCount = checklistItems.filter(item => item.isCompleted).length;
    const progressPercentage = checklistItems.length > 0 ? (completedCount / checklistItems.length) * 100 : 0;

    return (
        <div className="modal-overlay modern-card-overlay" onClick={onClose}>
            <div className="modal modern-card-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modern-card-header">
                    <div className="card-title-section">
                        {(isEditing || card.isNew) ? (
                            <input
                                type="text"
                                className="form-input modern-card-title-input"
                                placeholder="Kart başlığı"
                                value={formData.title}
                                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                            />
                        ) : (
                            <h2 className="modern-card-title">{card.title}</h2>
                        )}
                        <div className="card-actions">
                            {!card.isNew && !isEditing && (
                                <>
                                    <button className="btn btn-sm btn-secondary" onClick={() => setIsEditing(true)}>
                                        ✏️ Düzenle
                                    </button>
                                    <button className="btn btn-sm btn-danger" onClick={() => onDelete(card.id)}>
                                        🗑️ Sil
                                    </button>
                                </>
                            )}
                            {!card.isNew && isEditing && (
                                <>
                                    <button className="btn btn-sm btn-primary" onClick={handleSave}>
                                        💾 Kaydet
                                    </button>
                                    <button className="btn btn-sm" onClick={() => { setIsEditing(false); setFormData({
                                        title: card.title || '',
                                        description: card.description || '',
                                        dueDate: card.dueDate ? card.dueDate.slice(0, 16) : '',
                                        priority: card.priority || 'medium',
                                        status: card.status || 'pending',
                                        labels: card.labels || [],
                                        assignedUserId: card.assignedUserId || null
                                    }); }}>
                                        İptal
                                    </button>
                                </>
                            )}
                            {card.isNew && (
                                <button className="btn btn-sm btn-primary" onClick={handleSave}>
                                    💾 Kaydet
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="modern-card-content">
                    <div className="card-main-section">
                        {/* Açıklama */}
                        <div className="card-section">
                            <h3>Açıklama</h3>
                            {isEditing ? (
                                <textarea
                                    className="form-input form-textarea"
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    rows="3"
                                />
                            ) : (
                                <p className="card-description">{card.description || 'Açıklama eklenmemiş'}</p>
                            )}
                        </div>

                        {/* Kontrol Listesi */}
                        <div className="card-section">
                            <div className="checklist-header">
                                <h3>Kontrol Listesi</h3>
                                <div className="checklist-progress">
                                    <div className="progress-bar">
                                        <div 
                                            className="progress-fill" 
                                            style={{ width: `${progressPercentage}%` }}
                                        ></div>
                                    </div>
                                    <span className="progress-text">
                                        {completedCount} / {checklistItems.length}
                                    </span>
                                </div>
                            </div>

                            <div className="checklist-items">
                                {checklistItems.map((item) => (
                                    <div key={item.id} className="checklist-item">
                                        <input
                                            type="checkbox"
                                            checked={item.isCompleted}
                                            onChange={() => handleToggleChecklistItem(item.id, item.isCompleted)}
                                            className="checklist-checkbox"
                                        />
                                        <span className={`checklist-text ${item.isCompleted ? 'completed' : ''}`}>
                                            {item.text}
                                        </span>
                                        {item.assignedUser && (
                                            <span className="checklist-assignee">
                                                👤 {item.assignedUser.username}
                                            </span>
                                        )}
                                        {item.dueDate && (
                                            <span className="checklist-due-date">
                                                📅 {new Date(item.dueDate).toLocaleDateString('tr-TR')}
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="checklist-add">
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Bir öğe ekleyin"
                                    value={newChecklistItem}
                                    onChange={(e) => setNewChecklistItem(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleAddChecklistItem()}
                                />
                                <button className="btn btn-sm btn-primary" onClick={handleAddChecklistItem}>
                                    Ekle
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="card-sidebar">
                        {/* Atama */}
                        <div className="sidebar-section">
                            <h4>👤 Ata</h4>
                            <select
                                className="form-input"
                                value={card.assignedUserId || ''}
                                onChange={(e) => handleUpdateAssignment(e.target.value ? parseInt(e.target.value) : null)}
                            >
                                <option value="">Atanmamış</option>
                                {availableUsers.map(user => (
                                    <option key={user.id} value={user.id}>
                                        {user.username}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Bitiş Tarihi */}
                        <div className="sidebar-section">
                            <h4>⏰ Bitiş Tarihi</h4>
                            {isEditing ? (
                                <input
                                    type="datetime-local"
                                    className="form-input"
                                    value={formData.dueDate}
                                    onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                                />
                            ) : (
                                <p className="due-date">
                                    {card.dueDate ? new Date(card.dueDate).toLocaleDateString('tr-TR') : 'Tarih belirlenmemiş'}
                                </p>
                            )}
                        </div>

                        {/* Yorumlar */}
                        <div className="sidebar-section">
                            <h4>💬 Yorumlar</h4>
                            <div className="comments-section">
                                <div className="add-comment">
                                    <textarea
                                        className="form-input form-textarea"
                                        placeholder="Yorum yaz..."
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        rows="2"
                                    />
                                    <button className="btn btn-sm btn-primary" onClick={handleAddComment}>
                                        Yorum Ekle
                                    </button>
                                </div>

                                <div className="comments-list">
                                    {comments.map((comment) => (
                                        <div key={comment.id} className="comment-item">
                                            <div className="comment-header">
                                                <span className="comment-author">{comment.user?.username}</span>
                                                <span className="comment-date">
                                                    {new Date(comment.createdAt).toLocaleDateString('tr-TR')}
                                                </span>
                                            </div>
                                            <p className="comment-text">{comment.text}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModernCardDetailModal;
