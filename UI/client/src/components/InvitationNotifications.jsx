import React, { useState, useEffect } from 'react';

const InvitationNotifications = ({ userId, onInvitationAccepted }) => {
    const [invitations, setInvitations] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);

    const API_BASE = "http://localhost:5035/api";

    useEffect(() => {
        console.log('InvitationNotifications - userId:', userId);
        if (userId) {
            fetchInvitations();
        }
    }, [userId]);

    const fetchInvitations = async () => {
        try {
            console.log('Fetching invitations for user:', userId);
            const response = await fetch(`${API_BASE}/boardcollaboration/user/${userId}/invitations`);
            console.log('Invitations response:', response);
            if (response.ok) {
                const data = await response.json();
                console.log('Invitations data:', data);
                setInvitations(data);
            } else {
                console.log('Response not ok:', response.status);
            }
        } catch (err) {
            console.error('Error fetching invitations:', err);
        }
    };

    const handleRespondToInvitation = async (invitationId, accepted) => {
        try {
            const response = await fetch(`${API_BASE}/boardcollaboration/invitations/${invitationId}/respond`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ accepted })
            });

            if (response.ok) {
                const result = await response.json();
                if (accepted && onInvitationAccepted) {
                    onInvitationAccepted(result.boardId);
                }
                fetchInvitations(); // Listeyi yenile
            }
        } catch (err) {
            console.error('Error responding to invitation:', err);
        }
    };

    // Debug için her zaman göster
    console.log('InvitationNotifications render - userId:', userId, 'invitations:', invitations);
    
    if (invitations.length === 0) {
        return (
            <div className="invitation-notifications">
                <button 
                    className="notification-bell"
                    onClick={() => {
                        console.log('Notification bell clicked (no invitations), current state:', showNotifications);
                        setShowNotifications(!showNotifications);
                    }}
                >
                    🔔 0
                </button>
                {showNotifications && (
                    <div className="notifications-dropdown">
                        <div className="notifications-header">
                            <h4>Pano Davetleri</h4>
                            <button onClick={() => setShowNotifications(false)}>×</button>
                        </div>
                        <div className="notifications-list">
                            <p style={{ padding: '1rem', textAlign: 'center', color: '#666' }}>
                                Henüz davet bulunmuyor
                            </p>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="invitation-notifications">
            <button 
                className="notification-bell"
                onClick={() => {
                    console.log('Notification bell clicked, current state:', showNotifications);
                    setShowNotifications(!showNotifications);
                }}
            >
                🔔 {invitations.length}
            </button>

            {showNotifications && (
                <div className="notifications-dropdown">
                    <div className="notifications-header">
                        <h4>Pano Davetleri</h4>
                        <button onClick={() => setShowNotifications(false)}>×</button>
                    </div>
                    
                    <div className="notifications-list">
                        {invitations.map((invitation) => (
                            <div key={invitation.id} className="notification-item">
                                <div className="notification-content">
                                    <h5>{invitation.board.name}</h5>
                                    <p>
                                        <strong>{invitation.invitedBy.username}</strong> sizi bu panoya davet etti
                                    </p>
                                    <p className="notification-role">
                                        Rol: {invitation.role === 0 ? 'Görüntüleme' : invitation.role === 1 ? 'Düzenleme' : 'Sahip'}
                                    </p>
                                    <p className="notification-date">
                                        {new Date(invitation.createdAt).toLocaleDateString('tr-TR')}
                                    </p>
                                </div>
                                
                                <div className="notification-actions">
                                    <button 
                                        className="btn btn-sm btn-success"
                                        onClick={() => handleRespondToInvitation(invitation.id, true)}
                                    >
                                        ✅ Kabul Et
                                    </button>
                                    <button 
                                        className="btn btn-sm btn-danger"
                                        onClick={() => handleRespondToInvitation(invitation.id, false)}
                                    >
                                        ❌ Reddet
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default InvitationNotifications;
