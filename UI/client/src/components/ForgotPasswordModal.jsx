import React, { useState } from 'react';

const ForgotPasswordModal = ({ onClose, onShowReset }) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const API_BASE = "http://localhost:5035/api";

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email.trim()) return;

        setLoading(true);
        setError('');
        setMessage('');

        try {
            const response = await fetch(`${API_BASE}/auth/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email.trim()
                })
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(data.message);
                setEmail('');
            } else {
                setError(data.message || 'Şifre sıfırlama isteği gönderilirken bir hata oluştu');
            }
        } catch (err) {
            setError('Şifre sıfırlama isteği gönderilirken bir hata oluştu');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal forgot-password-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">Şifremi Unuttum</h2>
                    <button className="modal-close" onClick={onClose}>
                        ×
                    </button>
                </div>

                <div className="modal-content">
                    {!message ? (
                        <form onSubmit={handleSubmit} className="forgot-password-form">
                            <div className="form-group">
                                <label htmlFor="email" className="form-label">
                                    Email Adresiniz
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    className="form-input"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Email adresinizi girin"
                                    required
                                    autoFocus
                                />
                            </div>

                            {error && <div className="error">{error}</div>}

                            <div className="form-actions">
                                <button type="button" className="btn btn-secondary" onClick={onClose}>
                                    İptal
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={loading}>
                                    {loading ? 'Gönderiliyor...' : 'Şifre Sıfırlama Bağlantısı Gönder'}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="success-message">
                            <div className="success-icon">✓</div>
                            <h3>Başarılı!</h3>
                            <p>{message}</p>
                            <button className="btn btn-primary" onClick={onClose}>
                                Tamam
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordModal;
