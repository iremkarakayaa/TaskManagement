import React, { useState, useEffect } from 'react';
import { updateCard } from '../services/cardService';

const CardDetailModal = ({ card, onClose, onUpdate, onDelete }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        title: card.title || '',
        description: card.description || '',
        dueDate: card.dueDate ? card.dueDate.slice(0, 10) : '',
        priority: card.priority || 'medium',
        status: card.status || 'pending',
        labels: card.labels || [],
        // DÜZELTME: checklist'i her zaman diziye çevir
        checklist: Array.isArray(card.checklist) ? card.checklist : []
    });
    const [newLabel, setNewLabel] = useState('');
    const [newComment, setNewComment] = useState('');
    const [newChecklistItem, setNewChecklistItem] = useState('');

    useEffect(() => {
        setFormData({
            title: card.title || '',
            description: card.description || '',
            dueDate: card.dueDate ? card.dueDate.slice(0, 10) : '',
            priority: card.priority || 'medium',
            status: card.status || 'pending',
            labels: card.labels || [],
            // DÜZELTME: checklist'i her zaman diziye çevir
            checklist: Array.isArray(card.checklist) ? card.checklist : []
        });
    }, [card]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const updatedCard = await updateCard({
                ...card,
                title: formData.title,
                description: formData.description,
                dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
                priority: formData.priority,
                status: formData.status,
                labels: formData.labels,
                checklist: formData.checklist
            });
            onUpdate(updatedCard);
            setIsEditing(false);
        } catch (err) {
            console.error('Error updating card:', err);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAddLabel = () => {
        if (newLabel.trim() && !formData.labels.includes(newLabel.trim())) {
            setFormData(prev => ({
                ...prev,
                labels: [...prev.labels, newLabel.trim()]
            }));
            setNewLabel('');
        }
    };

    const handleRemoveLabel = (labelToRemove) => {
        setFormData(prev => ({
            ...prev,
            labels: prev.labels.filter(label => label !== labelToRemove)
        }));
    };

    const handleAddComment = () => {
        if (newComment.trim()) {
            // Burada backend'e yorum ekleme işlemi yapılacak
            console.log('Adding comment:', newComment);
            setNewComment('');
        }
    };

    const handleAddChecklistItem = async () => {
        if (newChecklistItem.trim()) {
            const newItem = {
                id: Date.now(),
                text: newChecklistItem.trim(),
                completed: false
            };

            // DÜZELTME: mevcut checklist'i güvenli şekilde al
            const updatedChecklist = [
                ...(Array.isArray(card.checklist) ? card.checklist : []),
                newItem
            ];

            try {
                await updateCard({
                    ...card,
                    checklist: updatedChecklist
                });
                setNewChecklistItem('');
            } catch (err) {
                console.error('Error adding checklist item:', err);
            }
        }
    };

    //const handleToggleChecklistItem = async (itemId) => {
    //    // DÜZELTME: formData.checklist dizi değilse koru
    //    const base = Array.isArray(formData.checklist) ? formData.checklist : [];
    //    const updatedChecklist = base.map(item => item.id === itemId ? { ...item, completed: !item.completed } : item);
    //    setFormData(prev => ({ ...prev, checklist: updatedChecklist }));
    //    try {
    //        await updateCard({ ...card, checklist: updatedChecklist });
    //    }
    //    catch (err) { console.error('Error updating checklist:', err); }
    //};

    const handleRemoveChecklistItem = async (itemId) => {
        // DÜZELTME: card.checklist dizi değilse koru
        const updatedChecklist = (Array.isArray(card.checklist) ? card.checklist : [])
            .filter(item => item.id !== itemId);

        try {
            await updateCard({
                ...card,
                checklist: updatedChecklist
            });
        } catch (err) {
            console.error('Error removing checklist item:', err);
        }
    };

    // ✅ toggle fonksiyonu
    const handleToggleChecklistItemView = async (itemId) => {
        const updatedChecklist = (Array.isArray(formData.checklist) ? formData.checklist : []).map(
            (item) =>
                item.id === itemId
                    ? { ...item, completed: !item.completed }
                    : item
        );

        try {
            await updateCard({
                ...formData,
                checklist: updatedChecklist,
            });
        } catch (err) {
            console.error("Error updating checklist:", err);
        }
    };


    const handleDelete = () => {
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
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal card-detail-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">
                        {isEditing ? 'Kartı Düzenle' : 'Kart Detayları'}
                    </h2>
                    <button className="modal-close" onClick={onClose}>
                        ×
                    </button>
                </div>

                {isEditing ? (
                    <form onSubmit={handleSubmit} className="card-edit-form">
                        <div className="form-group">
                            <label htmlFor="title" className="form-label">
                                Kart Başlığı *
                            </label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                className="form-input"
                                value={formData.title}
                                onChange={handleChange}
                                required
                                autoFocus
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="description" className="form-label">
                                Açıklama
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                className="form-input form-textarea"
                                value={formData.description}
                                onChange={handleChange}
                                rows="4"
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="dueDate" className="form-label">
                                    Teslim Tarihi
                                </label>
                                <input
                                    type="date"
                                    id="dueDate"
                                    name="dueDate"
                                    className="form-input"
                                    value={formData.dueDate}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="priority" className="form-label">
                                    Öncelik
                                </label>
                                <select
                                    id="priority"
                                    name="priority"
                                    className="form-input"
                                    value={formData.priority}
                                    onChange={handleChange}
                                >
                                    <option value="low">Düşük</option>
                                    <option value="medium">Orta</option>
                                    <option value="high">Yüksek</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="status" className="form-label">
                                    Durum
                                </label>
                                <select
                                    id="status"
                                    name="status"
                                    className="form-input"
                                    value={formData.status}
                                    onChange={handleChange}
                                >
                                    <option value="pending">Bekliyor</option>
                                    <option value="in-progress">Devam Ediyor</option>
                                    <option value="completed">Tamamlandı</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Etiketler</label>
                            <div className="labels-input">
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Yeni etiket ekle..."
                                    value={newLabel}
                                    onChange={(e) => setNewLabel(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddLabel())}
                                />
                                <button
                                    type="button"
                                    className="btn btn-sm btn-secondary"
                                    onClick={handleAddLabel}
                                >
                                    Ekle
                                </button>
                            </div>
                            <div className="labels-display">
                                {formData.labels.map((label, index) => (
                                    <span key={index} className="label-tag">
                                        {label}
                                        <button
                                            type="button"
                                            className="label-remove"
                                            onClick={() => handleRemoveLabel(label)}
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Kontrol Listesi</label>
                            <div className="checklist-input">
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Yeni görev ekle..."
                                    value={newChecklistItem}
                                    onChange={(e) => setNewChecklistItem(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddChecklistItem())}
                                />
                                <button
                                    type="button"
                                    className="btn btn-sm btn-secondary"
                                    onClick={handleAddChecklistItem}
                                >
                                    Ekle
                                </button>
                            </div>
                            <div className="checklist-display">
                                {/* DÜZELTME: güvenli map */}
                                {(Array.isArray(formData.checklist) ? formData.checklist : []).map((item) => (
                                    <div key={item.id} className="checklist-item">
                                        <input
                                            type="checkbox"
                                            checked={item.completed}
                                            onChange={() => handleToggleChecklistItemView(item.id)}
                                            className="checklist-checkbox"
                                        />
                                        <span className={`checklist-text ${item.completed ? 'completed' : ''}`}>
                                            {item.text}
                                        </span>
                                        <button
                                            type="button"
                                            className="checklist-remove"
                                            onClick={() => handleRemoveChecklistItem(item.id)}
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="form-actions">
                            <button type="button" className="btn btn-secondary" onClick={() => setIsEditing(false)}>
                                İptal
                            </button>
                            <button type="submit" className="btn btn-primary">
                                Kaydet
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="card-details">
                        {/* Kart Başlığı */}
                        <div className="card-section">
                            <h3>başlık</h3>
                            <p className="card-title-text">{card.title}</p>
                        </div>

                        {/* Öncelik ve Durum */}
                        <div className="card-section">
                            <div className="card-meta-row">
                                {card.priority && (
                                    <div className="meta-item">
                                        <span className="meta-label">Öncelik:</span>
                                        <span
                                            className="priority-badge"
                                            style={{ backgroundColor: getPriorityColor(card.priority) }}
                                        >
                                            {card.priority}
                                        </span>
                                    </div>
                                )}

                                {card.status && (
                                    <div className="meta-item">
                                        <span className="meta-label">Durum:</span>
                                        <span
                                            className="status-badge"
                                            style={{ backgroundColor: getStatusColor(card.status) }}
                                        >
                                            {card.status}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Açıklama */}
                        {card.description && (
                            <div className="card-section">
                                <h3>Açıklama</h3>
                                <p className="card-description-text">{card.description}</p>
                            </div>
                        )}

                        {/* Etiketler */}
                        {card.labels && card.labels.length > 0 && (
                            <div className="card-section">
                                <h3>Etiketler</h3>
                                <div className="labels-display">
                                    {card.labels.map((label, index) => (
                                        <span key={index} className="label-tag">
                                            {label}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Teslim Tarihi */}
                        {card.dueDate && (
                            <div className="card-section">
                                <h3>Teslim Tarihi</h3>
                                <p className={`due-date ${new Date(card.dueDate) < new Date() ? 'overdue' : ''}`}>
                                    📅 {new Date(card.dueDate).toLocaleDateString('tr-TR')}
                                    {new Date(card.dueDate) < new Date() && <span className="overdue-text"> (Gecikmiş)</span>}
                                </p>
                            </div>
                        )}

                        {/* Kontrol Listesi */}
                        <div className="card-section">
                            <h3>Kontrol Listesi</h3>
                            {/* DÜZELTME: checklist'in dizi olduğunu koşulda garanti et */}
                            {Array.isArray(card.checklist) && card.checklist.length > 0 ? (
                                <>
                                    <div className="checklist-display">
                                        {card.checklist.map((item) => (
                                            <div key={item.id} className="checklist-item">
                                                <input
                                                    type="checkbox"
                                                    checked={item.completed}
                                                    onChange={() => handleToggleChecklistItemView(item.id)}
                                                    className="checklist-checkbox"
                                                />
                                                <span className={`checklist-text ${item.completed ? 'completed' : ''}`}>
                                                    {item.text}
                                                </span>
                                                <button
                                                    type="button"
                                                    className="checklist-remove"
                                                    onClick={() => handleRemoveChecklistItem(item.id)}
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="checklist-progress">
                                        <div className="progress-bar">
                                            <div
                                                className="progress-fill"
                                                style={{
                                                    width: `${(card.checklist.filter(item => item.completed).length / card.checklist.length) * 100}%`
                                                }}
                                            ></div>
                                        </div>
                                        <span className="progress-text">
                                            {card.checklist.filter(item => item.completed).length} / {card.checklist.length} tamamlandı
                                        </span>
                                    </div>
                                </>
                            ) : (
                                <p className="no-checklist">Henüz kontrol listesi öğesi yok</p>
                            )}

                            {/* Kontrol Listesi Ekleme */}
                            <div className="checklist-add-section">
                                <div className="checklist-input">
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Yeni görev ekle..."
                                        value={newChecklistItem}
                                        onChange={(e) => setNewChecklistItem(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddChecklistItem())}
                                    />
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-secondary"
                                        onClick={handleAddChecklistItem}
                                    >
                                        Ekle
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Atanan Kullanıcı */}
                        {card.assignedUser && (
                            <div className="card-section">
                                <h3>Atanan Kullanıcı</h3>
                                <div className="assignee-info">
                                    <span className="assignee-avatar">
                                        {card.assignedUser.username?.charAt(0).toUpperCase() || 'U'}
                                    </span>
                                    <span className="assignee-name">{card.assignedUser.username}</span>
                                </div>
                            </div>
                        )}

                        {/* Yorumlar */}
                        <div className="card-section">
                            <h3>Yorumlar</h3>
                            <div className="comments-section">
                                <div className="add-comment">
                                    <textarea
                                        className="form-input form-textarea"
                                        placeholder="Yorum yazın..."
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        rows="3"
                                    />
                                    <button
                                        className="btn btn-sm btn-primary"
                                        onClick={handleAddComment}
                                    >
                                        Yorum Ekle
                                    </button>
                                </div>

                                {card.comments && card.comments.length > 0 ? (
                                    <div className="comments-list">
                                        {card.comments.map((comment, index) => (
                                            <div key={index} className="comment-item">
                                                <div className="comment-header">
                                                    <span className="comment-author">{comment.author || 'Kullanıcı'}</span>
                                                    <span className="comment-date">
                                                        {new Date(comment.createdAt).toLocaleDateString('tr-TR')}
                                                    </span>
                                                </div>
                                                <p className="comment-text">{comment.text}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="no-comments">Henüz yorum yok</p>
                                )}
                            </div>
                        </div>

                        {/* Tarih Bilgileri */}
                        <div className="card-section">
                            <div className="card-dates">
                                <div className="date-item">
                                    <span className="date-label">Oluşturulma:</span>
                                    <span>{new Date(card.createdAt).toLocaleDateString('tr-TR')}</span>
                                </div>
                                {card.updatedAt && card.updatedAt !== card.createdAt && (
                                    <div className="date-item">
                                        <span className="date-label">Son Güncelleme:</span>
                                        <span>{new Date(card.updatedAt).toLocaleDateString('tr-TR')}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Aksiyon Butonları */}
                        <div className="card-actions">
                            <button className="btn btn-secondary" onClick={() => setIsEditing(true)}>
                                ✏️ Düzenle
                            </button>
                            <button className="btn btn-danger" onClick={handleDelete}>
                                🗑️ Sil
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CardDetailModal;
