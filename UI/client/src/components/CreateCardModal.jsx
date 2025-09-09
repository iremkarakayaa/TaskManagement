import React, { useState, useEffect } from 'react';

const CreateCardModal = ({ onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        dueDate: '',
        isCompleted: false,
        checklist: [],
        assignedUserId: null
    });
    const [newChecklistItem, setNewChecklistItem] = useState('');
    const [availableUsers, setAvailableUsers] = useState([]);

    useEffect(() => {
        fetchAvailableUsers();
    }, []);

    const fetchAvailableUsers = async () => {
        try {
            const response = await fetch('http://localhost:5035/api/users');
            if (response.ok) {
                const users = await response.json();
                setAvailableUsers(users);
            }
        } catch (err) {
            console.error('Error fetching users:', err);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (formData.title.trim()) {
            const submitData = {
                ...formData,
                dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null
            };
            console.log('CreateCardModal - Submitting data:', submitData);
            onSubmit(submitData);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAddChecklistItem = () => {
        if (newChecklistItem.trim()) {
            const newItem = {
                id: Date.now(),
                text: newChecklistItem.trim(),
                completed: false
            };
            setFormData(prev => ({
                ...prev,
                checklist: [...prev.checklist, newItem]
            }));
            setNewChecklistItem('');
        }
    };

    const handleRemoveChecklistItem = (itemId) => {
        setFormData(prev => ({
            ...prev,
            checklist: prev.checklist.filter(item => item.id !== itemId)
        }));
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">Yeni Kart Oluştur</h2>
                    <button className="modal-close" onClick={onClose}>
                        ×
                    </button>
                </div>
                
                <form onSubmit={handleSubmit}>
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
                            placeholder="Kart başlığını girin..."
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
                            placeholder="Kart açıklaması (opsiyonel)..."
                            rows="3"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="dueDate" className="form-label">
                            Bitiş Tarihi
                        </label>
                        <input
                            type="datetime-local"
                            id="dueDate"
                            name="dueDate"
                            className="form-input"
                            value={formData.dueDate}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="assignedUserId" className="form-label">
                            Atanan Kullanıcı
                        </label>
                        <select
                            id="assignedUserId"
                            name="assignedUserId"
                            className="form-input"
                            value={formData.assignedUserId || ''}
                            onChange={handleChange}
                        >
                            <option value="">Atanmamış</option>
                            {availableUsers.map(user => (
                                <option key={user.id} value={user.id}>
                                    {user.username} ({user.email})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            <input
                                type="checkbox"
                                name="isCompleted"
                                checked={formData.isCompleted}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    isCompleted: e.target.checked
                                }))}
                            />
                            Tamamlandı olarak işaretle
                        </label>
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
                            {formData.checklist.map((item) => (
                                <div key={item.id} className="checklist-item">
                                    <span className="checklist-text">
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
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            İptal
                        </button>
                        <button type="submit" className="btn btn-primary">
                            Kart Oluştur
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateCardModal;

