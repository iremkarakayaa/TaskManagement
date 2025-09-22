import React, { useState, useEffect } from 'react';
import { 
    getUserNotifications, 
    getUnreadNotificationCount, 
    markNotificationAsRead, 
    markAllNotificationsAsRead,
    deleteNotification 
} from '../services/notificationService';

const InvitationNotifications = ({ userId, onInvitationAccepted }) => {
    const [invitations, setInvitations] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [activeTab, setActiveTab] = useState('invitations'); // 'invitations' veya 'notifications'
    const [unreadCount, setUnreadCount] = useState(0);

    const API_BASE = "http://localhost:5035/api";

    useEffect(() => {
        console.log('InvitationNotifications - userId:', userId);
        if (userId) {
            fetchInvitations();
            fetchNotifications();
            loadUnreadCount();
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

    const fetchNotifications = async () => {
        try {
            const data = await getUserNotifications(userId, false);
            setNotifications(data);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const loadUnreadCount = async () => {
        try {
            const count = await getUnreadNotificationCount(userId);
            setUnreadCount(count);
        } catch (error) {
            console.error('Error loading unread count:', error);
        }
    };

    const handleMarkAsRead = async (notificationId) => {
        try {
            await markNotificationAsRead(notificationId);
            setNotifications(prev => 
                prev.map(notif => 
                    notif.id === notificationId 
                        ? { ...notif, isRead: true, readAt: new Date().toISOString() }
                        : notif
                )
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await markAllNotificationsAsRead(userId);
            setNotifications(prev => 
                prev.map(notif => ({ ...notif, isRead: true, readAt: new Date().toISOString() }))
            );
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    };

    const handleDeleteNotification = async (notificationId) => {
        try {
            await deleteNotification(notificationId);
            setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
            const deletedNotif = notifications.find(n => n.id === notificationId);
            if (deletedNotif && !deletedNotif.isRead) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 0: return '👤'; // CardAssigned
            case 1: return '✏️'; // CardUpdated
            case 2: return '📋'; // CardMoved
            case 3: return '✅'; // CardCompleted
            case 4: return '📧'; // BoardInvitation
            case 5: return '💬'; // CommentAdded
            case 6: return '⏰'; // DueDateApproaching
            default: return '🔔';
        }
    };

    const getNotificationTypeText = (type) => {
        switch (type) {
            case 0: return 'Kart Ataması';
            case 1: return 'Kart Güncellendi';
            case 2: return 'Kart Taşındı';
            case 3: return 'Kart Tamamlandı';
            case 4: return 'Pano Daveti';
            case 5: return 'Yorum Eklendi';
            case 6: return 'Son Tarih Yaklaşıyor';
            default: return 'Bildirim';
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
    
    const totalCount = invitations.length + unreadCount;

    return (
        <div className="invitation-notifications">
            <button 
                className="notification-bell"
                onClick={() => {
                    console.log('Notification bell clicked, current state:', showNotifications);
                    setShowNotifications(!showNotifications);
                }}
            >
                <svg className="bell-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
                {totalCount > 0 && <span className="notification-count">{totalCount}</span>}
            </button>

            {showNotifications && (
                <div className="notifications-dropdown">
                    <div className="notifications-header">
                        <div className="notification-tabs">
                            <button 
                                className={`tab ${activeTab === 'invitations' ? 'active' : ''}`}
                                onClick={() => setActiveTab('invitations')}
                            >
                                Davetler ({invitations.length})
                            </button>
                            <button 
                                className={`tab ${activeTab === 'notifications' ? 'active' : ''}`}
                                onClick={() => setActiveTab('notifications')}
                            >
                                Bildirimler ({unreadCount})
                            </button>
                        </div>
                        <button onClick={() => setShowNotifications(false)}>×</button>
                    </div>

                    {activeTab === 'invitations' && (
                        <div className="notifications-list">
                            {invitations.length === 0 ? (
                                <p style={{ padding: '1rem', textAlign: 'center', color: '#666' }}>
                                    Henüz davet bulunmuyor
                                </p>
                            ) : (
                                invitations.map((invitation) => (
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
                                ))
                            )}
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div className="notifications-list">
                            {unreadCount > 0 && (
                                <div className="notification-actions">
                                    <button 
                                        className="btn btn-sm btn-primary"
                                        onClick={handleMarkAllAsRead}
                                    >
                                        Tümünü Okundu İşaretle
                                    </button>
                                </div>
                            )}
                            
                            {notifications.length === 0 ? (
                                <p style={{ padding: '1rem', textAlign: 'center', color: '#666' }}>
                                    Henüz bildirim yok
                                </p>
                            ) : (
                                notifications.map(notification => (
                                    <div 
                                        key={notification.id} 
                                        className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                                    >
                                        <div className="notification-icon">
                                            {getNotificationIcon(notification.type)}
                                        </div>
                                        <div className="notification-content">
                                            <div className="notification-title">
                                                {notification.title}
                                                {!notification.isRead && <span className="unread-dot"></span>}
                                            </div>
                                            <div className="notification-message">
                                                {notification.message}
                                            </div>
                                            <div className="notification-meta">
                                                <span className="notification-type">
                                                    {getNotificationTypeText(notification.type)}
                                                </span>
                                                <span className="notification-date">
                                                    {new Date(notification.createdAt).toLocaleDateString('tr-TR', {
                                                        day: '2-digit',
                                                        month: '2-digit',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="notification-actions-item">
                                            {!notification.isRead && (
                                                <button 
                                                    className="btn btn-sm btn-secondary"
                                                    onClick={() => handleMarkAsRead(notification.id)}
                                                    title="Okundu işaretle"
                                                >
                                                    ✓
                                                </button>
                                            )}
                                            <button 
                                                className="btn btn-sm btn-danger"
                                                onClick={() => handleDeleteNotification(notification.id)}
                                                title="Sil"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default InvitationNotifications;
