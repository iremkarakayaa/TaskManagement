import axios from "axios";

const API_URL = "http://localhost:5035/api/notifications";

// Kullanıcının bildirimlerini getir
export async function getUserNotifications(userId, unreadOnly = false) {
    try {
        const response = await axios.get(`${API_URL}/user/${userId}?unreadOnly=${unreadOnly}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching notifications:", error);
        throw error;
    }
}

// Okunmamış bildirim sayısını getir
export async function getUnreadNotificationCount(userId) {
    try {
        const response = await axios.get(`${API_URL}/user/${userId}/count`);
        return response.data.count;
    } catch (error) {
        console.error("Error fetching notification count:", error);
        throw error;
    }
}

// Bildirimi okundu olarak işaretle
export async function markNotificationAsRead(notificationId) {
    try {
        const response = await axios.put(`${API_URL}/${notificationId}/read`);
        return response.data;
    } catch (error) {
        console.error("Error marking notification as read:", error);
        throw error;
    }
}

// Tüm bildirimleri okundu olarak işaretle
export async function markAllNotificationsAsRead(userId) {
    try {
        const response = await axios.put(`${API_URL}/user/${userId}/read-all`);
        return response.data;
    } catch (error) {
        console.error("Error marking all notifications as read:", error);
        throw error;
    }
}

// Bildirimi sil
export async function deleteNotification(notificationId) {
    try {
        const response = await axios.delete(`${API_URL}/${notificationId}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting notification:", error);
        throw error;
    }
}






