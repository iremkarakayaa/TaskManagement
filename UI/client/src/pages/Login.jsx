import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import ForgotPasswordModal from "../components/ForgotPasswordModal";

function Login({ onLogin }) {
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            // Backend API PostgreSQL'e bağlı
            const response = await axios.post("http://localhost:5035/api/auth/login", {
                email: formData.email,
                password: formData.password
            });


            // Token olmadan sadece user objesini alıyoruz
            if (response.data.user) {
                try { localStorage.setItem('authUser', JSON.stringify(response.data.user)); } catch {}
                onLogin(response.data.user); // App state güncelleniyor
                navigate("/dashboard");
            } else {
                setError("Giriş başarısız. Lütfen bilgilerinizi kontrol edin.");
            }
        } catch (err) {
            setError(err.response?.data?.message || "Giriş yapılırken bir hata oluştu.");
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
        <div className="app">
            <div className="auth-container">
                <div className="auth-box">
                    <div className="auth-header">
                        <h1>📋 TaskManager</h1>
                        <p>Görevlerinizi organize edin</p>
                    </div>

                    <form onSubmit={handleSubmit} className="auth-form">
                        {error && <div className="error">{error}</div>}

                        <div className="form-group">
                            <label htmlFor="email" className="form-label">
                                E-posta veya Kullanıcı Adı
                            </label>
                            <input
                                type="text"
                                id="email"
                                name="email"
                                className="form-input"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                autoFocus
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password" className="form-label">
                                Şifre
                            </label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                className="form-input"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary auth-submit"
                            disabled={loading}
                        >
                            {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
                        </button>
                    </form>

                    <div className="auth-footer">
                        <p>
                            Hesabınız yok mu?{" "}
                            <Link to="/register" className="auth-link">
                                Kayıt Ol
                            </Link>
                        </p>
                    </div>
                </div>
            </div>

            {showForgotPassword && (
                <ForgotPasswordModal
                    onClose={() => setShowForgotPassword(false)}
                />
            )}
        </div>
    );
}

export default Login;
