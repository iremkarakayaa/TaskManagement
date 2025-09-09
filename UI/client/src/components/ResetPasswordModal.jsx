import React, { useState } from 'react';

const ResetPasswordModal = ({ token, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        newPassword: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const API_BASE = "http://localhost:5035/api";

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (formData.newPassword !== formData.confirmPassword) {
            setError('Şifreler eşleşmiyor');
            return;
        }

        if (formData.newPassword.length < 6) {
            setError('Şifre en az 6 karakter olmalıdır');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch(`${API_BASE}/auth/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token: token,
                    newPassword: formData.newPassword
                })
            });

            const data = await response.json();

            if (response.ok) {
                onSuccess(data.message);
                onClose();
            } else {
                setError(data.message || 'Şifre sıfırlanırken bir hata oluştu');
            }
        } catch (err) {
            setError('Şifre sıfırlanırken bir hata oluştu');
            console.error('Error:', err);
        } finally {
            setLoading(false);
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
            <div className="modal reset-password-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">Yeni Şifre Belirle</h2>
                    <button className="modal-close" onClick={onClose}>
                        ×
                    </button>
                </div>

                <div className="modal-content">
                    <form onSubmit={handleSubmit} className="reset-password-form">
                        <div className="form-group">
                            <label htmlFor="newPassword" className="form-label">
                                Yeni Şifre
                            </label>
                            <input
                                type="password"
                                id="newPassword"
                                name="newPassword"
                                className="form-input"
                                value={formData.newPassword}
                                onChange={handleChange}
                                placeholder="Yeni şifrenizi girin"
                                required
                                autoFocus
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword" className="form-label">
                                Şifre Tekrar
                            </label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                className="form-input"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Şifrenizi tekrar girin"
                                required
                            />
                        </div>

                        {error && <div className="error">{error}</div>}

                        <div className="form-actions">
                            <button type="button" className="btn btn-secondary" onClick={onClose}>
                                İptal
                            </button>
                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                {loading ? 'Sıfırlanıyor...' : 'Şifreyi Sıfırla'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordModal;
