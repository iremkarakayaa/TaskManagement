import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Board from './pages/Board';
import './App.css';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);

    // Sayfa yenilemede oturumu koru
    useEffect(() => {
        try {
            const storedUser = localStorage.getItem('authUser');
            if (storedUser) {
                const parsed = JSON.parse(storedUser);
                if (parsed && parsed.id) {
                    setUser(parsed);
                    setIsAuthenticated(true);
                }
            }
        } catch {}
    }, []);

    // Login işlemi sonrası çağrılacak
    const handleLogin = (userData) => {
        setIsAuthenticated(true);
        setUser(userData);
        try { localStorage.setItem('authUser', JSON.stringify(userData)); } catch {}
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        setUser(null);
        try { localStorage.removeItem('authUser'); } catch {}
    };

    return (
        <Router>
            <div className="app">
                <Routes>
                    <Route
                        path="/"
                        element={isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />}
                    />
                    <Route path="/login" element={<Login onLogin={handleLogin} />} />
                    <Route path="/register" element={<Register />} />
                    <Route
                        path="/dashboard"
                        element={
                            isAuthenticated ?
                                <Dashboard user={user} onLogout={handleLogout} /> :
                                <Navigate to="/login" />
                        }
                    />
                    <Route
                        path="/board/:boardId"
                        element={
                            isAuthenticated ?
                                <Board user={user} onLogout={handleLogout} /> :
                                <Navigate to="/login" />
                        }
                    />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
