import React, { useState, useEffect } from 'react';
import { assignCardToUser, unassignCard } from '../services/cardService';

const ModernCardDetailModal = ({ boardId, card, onClose, onUpdate, onDelete }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        title: card.title || '',
        description: card.description || '',
        dueDate: card.dueDate ? card.dueDate.slice(0, 16) : '',
        priority: card.priority || 'medium',
        status: card.status || 'pending',
        labels: card.labels || [],
        assignedUserId: card.assignedUserId || null,
        assignedUserIds: Array.isArray(card.assignedUserIds) 
            ? card.assignedUserIds 
            : (typeof card.assignedUserIds === 'string' ? JSON.parse(card.assignedUserIds || '[]') : [])
    });
    const [newLabel, setNewLabel] = useState('');
    const [newComment, setNewComment] = useState('');
    const [newChecklistItem, setNewChecklistItem] = useState('');
    const [checklistItems, setChecklistItems] = useState([]);
    const [availableUsers, setAvailableUsers] = useState([]);
    const [comments, setComments] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showUserDropdown, setShowUserDropdown] = useState(false);
    const dropdownRef = React.useRef(null);

    const API_BASE = "http://localhost:5035/api";

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowUserDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        let parsedAssignedUserIds = [];
        try {
            parsedAssignedUserIds = Array.isArray(card.assignedUserIds) 
                ? card.assignedUserIds 
                : (typeof card.assignedUserIds === 'string' ? JSON.parse(card.assignedUserIds || '[]') : []);
        } catch (e) {
            console.error("Error parsing assignedUserIds:", e);
        }

        setFormData({
            title: card.title || '',
            description: card.description || '',
            dueDate: card.dueDate ? card.dueDate.slice(0, 16) : '',
            priority: card.priority || 'medium',
            status: card.status || 'pending',
            labels: card.labels || [],
            assignedUserId: card.assignedUserId || null,
            assignedUserIds: parsedAssignedUserIds
        });
        
        // Her durumda board members'ı yükle
        fetchBoardMembers();
        
        // Sadece mevcut kartlar için checklist ve comments yükle
        if (card.id) {
            fetchChecklistItems();
            fetchComments();
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
                console.log('Fetched Board Members:', members); // Debug için log ekledik
                setAvailableUsers(members);
            }
        } catch (err) {
            console.error('Error fetching board members:', err);
        }
    };

    const handleSave = async () => {
        if (!formData.title || formData.title.trim().length === 0) {
            alert('Lütfen kart başlığını girin!');
            return;
        }
        
        setIsSaving(true);
        
        try {
            if (!card.id) {
                // Yeni kart oluştur
                const cardData = {
                    title: formData.title.trim(),
                    description: formData.description || '',
                    dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
                    priority: formData.priority,
                    status: formData.status,
                    labels: formData.labels,
                    assignedUserId: formData.assignedUserIds.length > 0 ? formData.assignedUserIds[0] : null,
                    assignedUserIds: formData.assignedUserIds,
                    checklist: []
                };
                console.log('Yeni kart oluşturuluyor:', cardData);
                onUpdate(cardData);
            } else {
                // Mevcut kartı güncelle - API'nin beklediği format
                const updatePayload = {
                    id: card.id,
                    title: formData.title.trim(),
                    description: formData.description || '',
                    dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
                    priority: formData.priority,
                    status: formData.status,
                    labels: JSON.stringify(formData.labels || []),
                    checklist: JSON.stringify(card.checklist || []),
                    isCompleted: card.isCompleted || false,
                    assignedUserId: formData.assignedUserIds.length > 0 ? formData.assignedUserIds[0] : null,
                    assignedUserIds: JSON.stringify(formData.assignedUserIds)
                };
                onUpdate(updatePayload);
                setIsEditing(false);
            }
        } catch (error) {
            console.error('Kart kaydedilirken hata:', error);
            alert('Kart kaydedilirken bir hata oluştu!');
        } finally {
            setIsSaving(false);
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

    const handleUpdateAssignment = (userId) => {
        const currentIds = [...(formData.assignedUserIds || [])];
        const index = currentIds.indexOf(userId);
        
        let newIds;
        if (index > -1) {
            // Zaten seçili, kaldır
            newIds = currentIds.filter(id => id !== userId);
        } else {
            // Seçili değil, ekle
            newIds = [...currentIds, userId];
        }

        console.log('Local assignment change:', newIds);
        
        // UI'ı hemen güncelle ama API'ye henüz gönderme
        setFormData(prev => ({ ...prev, assignedUserIds: newIds }));
    };

    const handleConfirmAssignment = async () => {
        if (!card.id) return;

        try {
            setIsSaving(true);
            const updatePayload = {
                ...formData,
                id: card.id,
                title: (formData.title ?? card.title ?? '').toString().trim(),
                description: formData.description ?? card.description ?? '',
                dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : (card.dueDate || null),
                priority: formData.priority || card.priority || 'medium',
                status: formData.status || card.status || 'pending',
                labels: JSON.stringify(formData.labels && formData.labels.length ? formData.labels : (card.labels || [])),
                checklist: JSON.stringify(Array.isArray(card.checklist) ? card.checklist : []),
                isCompleted: card.isCompleted ?? false,
                assignedUserId: formData.assignedUserIds.length > 0 ? formData.assignedUserIds[0] : null,
                assignedUserIds: formData.assignedUserIds // Burada dizi olarak gönderiyoruz, Board.jsx ve API bunu ele alacak
            };
            
            await onUpdate(updatePayload);
            alert('Atamalar başarıyla güncellendi.');
        } catch (err) {
            console.error('Error confirming assignment:', err);
            alert('Atama güncellenirken bir hata oluştu.');
        } finally {
            setIsSaving(false);
        }
    };

    const completedCount = checklistItems.filter(item => item.isCompleted).length;
    const progressPercentage = checklistItems.length > 0 ? (completedCount / checklistItems.length) * 100 : 0;

    // Debug logging
    console.log('ModernCardDetailModal - card.id:', card.id);
    console.log('ModernCardDetailModal - card:', card);
    console.log('ModernCardDetailModal - isEditing:', isEditing);
    console.log('ModernCardDetailModal - availableUsers:', availableUsers);

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
                            <div className="user-selection-container">
                                {/* Seçili Kullanıcılar (Chips) */}
                                <div className="selected-users-chips">
                                    {availableUsers.filter(u => {
                                        const uId = u.id || u.Id || u.userId || u.UserId || (u.user && (u.user.id || u.user.Id));
                                        return (formData.assignedUserIds || []).includes(uId);
                                    }).map(user => {
                                        const uId = user.id || user.Id || user.userId || user.UserId || (user.user && (user.user.id || user.user.Id));
                                        const uName = user.username || user.Username || user.userName || user.UserName || (user.user && (user.user.username || user.user.Username)) || user.email || user.Email || "İsimsiz";
                                        
                                        return (
                                            <div key={uId} className="user-chip">
                                                <span className="chip-name">{uName}</span>
                                                <button className="chip-remove" onClick={() => handleUpdateAssignment(uId)}>×</button>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Arama ve Seçim Barı */}
                                <div className="user-search-bar-wrapper" ref={dropdownRef}>
                                    <input
                                        type="text"
                                        className="form-input user-search-input"
                                        placeholder="Kullanıcı ara..."
                                        value={searchTerm}
                                        onChange={(e) => {
                                            setSearchTerm(e.target.value);
                                            setShowUserDropdown(true);
                                        }}
                                        onFocus={() => setShowUserDropdown(true)}
                                        onClick={() => setShowUserDropdown(true)}
                                    />
                                    
                                    {showUserDropdown && (
                                        <div className="user-dropdown-list">
                                            {availableUsers
                                                .filter(u => {
                                                    const uId = u.id || u.Id || u.userId || u.UserId || (u.user && (u.user.id || u.user.Id));
                                                    const uName = (u.username || u.Username || u.userName || u.UserName || (u.user && (u.user.username || u.user.Username)) || u.email || u.Email || "").toLowerCase();
                                                    // Hem arama terimine uymalı hem de henüz seçilmemiş olmalı
                                                    const isSearchMatch = uName.includes(searchTerm.toLowerCase());
                                                    const isAlreadySelected = (formData.assignedUserIds || []).some(id => id === uId);
                                                    return isSearchMatch && !isAlreadySelected;
                                                })
                                                .map(user => {
                                                    const uId = user.id || user.Id || user.userId || user.UserId || (user.user && (user.user.id || user.user.Id));
                                                    const uName = user.username || user.Username || user.userName || user.UserName || (user.user && (user.user.username || user.user.Username)) || user.email || user.Email || "İsimsiz";
                                                    const isOwner = user.isOwner === true || user.role === "Owner" || user.Role === "Owner";
                                                    
                                                    return (
                                                        <div 
                                                            key={uId} 
                                                            className="user-dropdown-item"
                                                            onClick={() => {
                                                                handleUpdateAssignment(uId);
                                                                setSearchTerm('');
                                                                setShowUserDropdown(false);
                                                            }}
                                                        >
                                                            <div className="dropdown-user-info">
                                                                <span className="dropdown-user-name">{uName}</span>
                                                                {isOwner && <span className="owner-badge-mini">Sahip</span>}
                                                            </div>
                                                            <span className="add-plus">+</span>
                                                        </div>
                                                    );
                                                })}
                                            {availableUsers.filter(u => {
                                                const uId = u.id || u.Id || u.userId || u.UserId;
                                                const isAlreadySelected = (formData.assignedUserIds || []).some(id => id === uId);
                                                return !isAlreadySelected && (u.username || u.Username || "").toLowerCase().includes(searchTerm.toLowerCase());
                                            }).length === 0 && (
                                                <div className="no-results">
                                                    {availableUsers.length === (formData.assignedUserIds || []).length 
                                                        ? "Tüm üyeler seçildi" 
                                                        : "Eşleşen kullanıcı bulunamadı"}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                            {card.id && (
                                <button 
                                    className="btn btn-sm btn-primary assign-confirm-btn"
                                    onClick={handleConfirmAssignment}
                                    disabled={isSaving}
                                >
                                    {isSaving ? '💾 Kaydediliyor...' : '👤 Atamaları Güncelle'}
                                </button>
                            )}
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

                {/* Action Buttons - Bottom of Modal */}
                {console.log('Rendering modal footer - card.id:', card.id, 'isEditing:', isEditing)}
                <div className="modal-footer">
                    {!card.id ? (
                        <button 
                            type="button"
                            className="btn btn-primary btn-large" 
                            onClick={handleSave}
                            disabled={isSaving}
                        >
                            {isSaving ? '⏳ Kart Ekleniyor...' : '➕ Kartı Ekle'}
                        </button>
                    ) : (
                        <div className="card-actions">
                            {!isEditing ? (
                                <>
                                    <button 
                                        type="button"
                                        className="btn btn-primary" 
                                        onClick={() => setIsEditing(true)}
                                    >
                                        ✏️ Düzenle
                                    </button>
                                    <button 
                                        type="button"
                                        className="btn btn-danger" 
                                        onClick={() => {
                                            if (window.confirm('Bu kartı silmek istediğinizden emin misiniz?')) {
                                                onDelete(card.id);
                                            }
                                        }}
                                    >
                                        🗑️ Sil
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button 
                                        type="button"
                                        className="btn btn-success" 
                                        onClick={handleSave}
                                        disabled={isSaving}
                                    >
                                        {isSaving ? '⏳ Kaydediliyor...' : '💾 Kaydet'}
                                    </button>
                                    <button 
                                        type="button"
                                        className="btn btn-secondary" 
                                        onClick={() => {
                                            setIsEditing(false);
                                            setFormData({
                                                title: card.title || '',
                                                description: card.description || '',
                                                dueDate: card.dueDate ? card.dueDate.slice(0, 16) : '',
                                                priority: card.priority || 'medium',
                                                status: card.status || 'pending',
                                                labels: card.labels || [],
                                                assignedUserId: card.assignedUserId || null
                                            });
                                        }}
                                    >
                                        ❌ İptal
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ModernCardDetailModal;
