import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function Register() {
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: ""
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        // Şifreler eşleşmeli
        if (formData.password !== formData.confirmPassword) {
            setError("Şifreler eşleşmiyor.");
            setLoading(false);
            return;
        }

        try {
            // Backend API PostgreSQL'e bağlı
            const response = await axios.post("http://localhost:5035/api/auth/register", {
                username: formData.username,
                email: formData.email,
                password: formData.password
            });

            if (response.data.message === "Kayıt başarılı") {
                navigate("/login");
            } else {
                setError(response.data.message || "Kayıt başarısız.");
            }

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
                        <p>Hesap oluşturun ve başlayın</p>
                    </div>

                    <form onSubmit={handleSubmit} className="auth-form">
                        {error && <div className="error">{error}</div>}

                        <div className="form-group">
                            <label htmlFor="username" className="form-label">
                                Kullanıcı Adı
                            </label>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                className="form-input"
                                value={formData.username}
                                onChange={handleChange}
                                placeholder="Kullanıcı adınızı girin"
                                required
                                autoFocus
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="email" className="form-label">
                                E-posta
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                className="form-input"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="ornek@email.com"
                                required
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
                                placeholder="Şifrenizi girin"
                                required
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

                        <button
                            type="submit"
                            className="btn btn-primary auth-submit"
                            disabled={loading}
                        >
                            {loading ? "Kayıt olunuyor..." : "Kayıt Ol"}
                        </button>
                    </form>

                    <div className="auth-footer">
                        <p>
                            Zaten hesabınız var mı?{" "}
                            <Link to="/login" className="auth-link">
                                Giriş Yap
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Register;
