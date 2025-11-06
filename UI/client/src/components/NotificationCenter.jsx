import React, { useState, useEffect } from 'react';
import { 
    getUserNotifications, 
    getUnreadNotificationCount, 
    markNotificationAsRead, 
    markAllNotificationsAsRead,
    deleteNotification 
} from '../services/notificationService';

const NotificationCenter = ({ userId, isOpen, onClose }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('all'); // 'all' veya 'unread'

    useEffect(() => {
        if (isOpen && userId) {
            loadNotifications();
            loadUnreadCount();
        }
    }, [isOpen, userId]);

    const loadNotifications = async () => {
        setLoading(true);
        try {
            const data = await getUserNotifications(userId, activeTab === 'unread');
            setNotifications(data);
        } catch (error) {
            console.error('Error loading notifications:', error);
        } finally {
            setLoading(false);
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
            // Eğer silinen bildirim okunmamışsa sayacı güncelle
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

    if (!isOpen) return null;

    return (
        <div className="notification-overlay" onClick={onClose}>
            <div className="notification-center" onClick={(e) => e.stopPropagation()}>
                <div className="notification-header">
                    <h3>Bildirimler</h3>
                    <div className="notification-tabs">
                        <button 
                            className={`tab ${activeTab === 'all' ? 'active' : ''}`}
                            onClick={() => setActiveTab('all')}
                        >
                            Tümü
                        </button>
                        <button 
                            className={`tab ${activeTab === 'unread' ? 'active' : ''}`}
                            onClick={() => setActiveTab('unread')}
                        >
                            Okunmamış ({unreadCount})
                        </button>
                    </div>
                    <button className="notification-close" onClick={onClose}>×</button>
                </div>

                <div className="notification-actions">
                    {unreadCount > 0 && (
                        <button 
                            className="btn btn-sm btn-primary"
                            onClick={handleMarkAllAsRead}
                        >
                            Tümünü Okundu İşaretle
                        </button>
                    )}
                </div>

                <div className="notification-list">
                    {loading ? (
                        <div className="notification-loading">Yükleniyor...</div>
                    ) : notifications.length === 0 ? (
                        <div className="notification-empty">
                            {activeTab === 'unread' ? 'Okunmamış bildirim yok' : 'Bildirim yok'}
                        </div>
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
            </div>
        </div>
    );
};

export default NotificationCenter;





