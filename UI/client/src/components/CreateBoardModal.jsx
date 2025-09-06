import React, { useState } from 'react';

const CreateBoardModal = ({ onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (formData.title.trim()) {
            onSubmit(formData);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">Yeni Pano Oluştur</h2>
                    <button className="modal-close" onClick={onClose}>
                        ×
                    </button>
                </div>
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="title" className="form-label">
                            Pano Adı *
                        </label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            className="form-input"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="Proje adını girin..."
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
                            placeholder="Pano açıklaması (opsiyonel)..."
                            rows="3"
                        />
                    </div>
                    
                    <div className="form-actions">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            İptal
                        </button>
                        <button type="submit" className="btn btn-primary">
                            Pano Oluştur
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateBoardModal;

