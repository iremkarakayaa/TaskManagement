import React, { useState } from 'react';

const CreateListModal = ({ onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        name: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (formData.name.trim()) {
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
                    <h2 className="modal-title">Yeni Liste Oluştur</h2>
                    <button className="modal-close" onClick={onClose}>
                        ×
                    </button>
                </div>
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="name" className="form-label">
                            Liste Adı *
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            className="form-input"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Liste adını girin..."
                            required
                            autoFocus
                        />
                    </div>
                    
                    <div className="form-actions">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            İptal
                        </button>
                        <button type="submit" className="btn btn-primary">
                            Liste Oluştur
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateListModal;

