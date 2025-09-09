import React, { useState, useEffect } from 'react';

const BoardCollaborationModal = ({ boardId, onClose }) => {
    const [members, setMembers] = useState([]);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState('viewer');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [availableUsers, setAvailableUsers] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState('');

    const API_BASE = "http://localhost:5035/api";

    useEffect(() => {
        fetchMembers();
        fetchAvailableUsers();
    }, [boardId]);

    const fetchMembers = async () => {
        try {
            const response = await fetch(`${API_BASE}/boardcollaboration/${boardId}/members`);
            if (response.ok) {
                const data = await response.json();
                setMembers(data);
            }
        } catch (err) {
            console.error('Error fetching members:', err);
        }
    };

    const fetchAvailableUsers = async () => {
        try {
            const response = await fetch(`${API_BASE}/users`);
            if (response.ok) {
                const data = await response.json();
                setAvailableUsers(data);
            }
        } catch (err) {
            console.error('Error fetching users:', err);
        }
    };

    const handleInviteUser = async (e) => {
        e.preventDefault();
        if (!selectedUserId) return;

        setLoading(true);
        setError('');

        try {
            const response = await fetch(`${API_BASE}/boardcollaboration/${boardId}/invite`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: parseInt(selectedUserId),
                    role: inviteRole === 'viewer' ? 0 : inviteRole === 'editor' ? 1 : 2,
                    message: 'Pano daveti'
                })
            });

            if (response.ok) {
                setSelectedUserId('');
                fetchMembers(); // Üyeleri yeniden yükle
                alert('Davet başarıyla gönderildi!');
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Kullanıcı davet edilirken bir hata oluştu');
            }
        } catch (err) {
            setError('Kullanıcı davet edilirken bir hata oluştu');
            console.error('Error inviting user:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateRole = async (userId, newRole) => {
        try {
            const response = await fetch(`${API_BASE}/boardcollaboration/${boardId}/members/${userId}/role`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    role: newRole
                })
            });

            if (response.ok) {
                fetchMembers(); // Üyeleri yeniden yükle
            }
        } catch (err) {
            console.error('Error updating role:', err);
        }
    };

    const handleRemoveMember = async (userId) => {
        if (!window.confirm('Bu üyeyi panodan çıkarmak istediğinizden emin misiniz?')) {
            return;
        }

        try {
            const response = await fetch(`${API_BASE}/boardcollaboration/${boardId}/members/${userId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                fetchMembers(); // Üyeleri yeniden yükle
            }
        } catch (err) {
            console.error('Error removing member:', err);
        }
    };

    const getRoleText = (role) => {
        switch (role) {
            case 0: return 'Görüntüleme';
            case 1: return 'Düzenleme';
            case 2: return 'Sahip';
            default: return 'Bilinmiyor';
        }
    };

    const getRoleColor = (role) => {
        switch (role) {
            case 0: return '#6c757d';
            case 1: return '#007bff';
            case 2: return '#28a745';
            default: return '#6c757d';
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal board-collaboration-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">Pano İşbirliği</h2>
                    <button className="modal-close" onClick={onClose}>
                        ×
                    </button>
                </div>

                <div className="modal-content">
                    {/* Kullanıcı Davet Etme */}
                    <div className="invite-section">
                        <h3>Kullanıcı Davet Et</h3>
                        <form onSubmit={handleInviteUser} className="invite-form">
                            <div className="form-group">
                                <select
                                    className="form-input"
                                    value={selectedUserId}
                                    onChange={(e) => setSelectedUserId(e.target.value)}
                                    required
                                >
                                    <option value="">Kullanıcı seçin</option>
                                    {availableUsers.map(user => (
                                        <option key={user.id} value={user.id}>
                                            {user.username} ({user.email})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <select
                                    className="form-input"
                                    value={inviteRole}
                                    onChange={(e) => setInviteRole(e.target.value)}
                                >
                                    <option value="viewer">Görüntüleme</option>
                                    <option value="editor">Düzenleme</option>
                                    <option value="owner">Sahip</option>
                                </select>
                            </div>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={loading}
                            >
                                {loading ? 'Davet Ediliyor...' : 'Davet Et'}
                            </button>
                        </form>
                        {error && <div className="error">{error}</div>}
                    </div>

                    {/* Üye Listesi */}
                    <div className="members-section">
                        <h3>Pano Üyeleri</h3>
                        <div className="members-list">
                            {members.map((member) => (
                                <div key={member.id} className="member-item">
                                    <div className="member-info">
                                        <div className="member-avatar">
                                            {member.user.username.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="member-details">
                                            <div className="member-name">{member.user.username}</div>
                                            <div className="member-email">{member.user.email}</div>
                                        </div>
                                    </div>
                                    <div className="member-actions">
                                        <select
                                            className="role-select"
                                            value={member.role}
                                            onChange={(e) => handleUpdateRole(member.user.id, parseInt(e.target.value))}
                                        >
                                            <option value={0}>Görüntüleme</option>
                                            <option value={1}>Düzenleme</option>
                                            <option value={2}>Sahip</option>
                                        </select>
                                        <button
                                            className="btn btn-sm btn-danger"
                                            onClick={() => handleRemoveMember(member.user.id)}
                                        >
                                            Çıkar
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BoardCollaborationModal;
