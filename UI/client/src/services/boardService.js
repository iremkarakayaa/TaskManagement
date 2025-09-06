import axios from "axios";

const API_URL = "http://localhost:5035/api/boards";

// Tüm boardları getir
export async function getBoards() {
    try {
        const response = await axios.get(API_URL);
        return response.data;
    } catch (error) {
        console.error("Error fetching boards:", error);
        throw error;
    }
}

// ID'ye göre board getir
export async function getBoardById(boardId) {
    try {
        const response = await axios.get(`${API_URL}/${boardId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching board:", error);
        throw error;
    }
}

// Yeni board oluştur
export async function createBoard(name, description = "", ownerUserId) {
    if (!ownerUserId) throw new Error("OwnerUserId gereklidir");

    try {
        const response = await axios.post(API_URL, {
            name: name,
            description: description,
            ownerUserId: ownerUserId
        });
        return response.data;
    } catch (error) {
        console.error("Error creating board:", error);
        throw error;
    }
}

// Board güncelle
export async function updateBoard(boardId, boardData) {
    try {
        const response = await axios.put(`${API_URL}/${boardId}`, boardData);
        return response.data;
    } catch (error) {
        console.error("Error updating board:", error);
        throw error;
    }
}

// Board sil
export async function deleteBoard(boardId) {
    try {
        await axios.delete(`${API_URL}/${boardId}`);
        return true;
    } catch (error) {
        console.error("Error deleting board:", error);
        throw error;
    }
}

// Board arşivle (IsArchived özelliği varsa)
export async function archiveBoard(boardId, archived = true) {
    try {
        const response = await axios.put(`${API_URL}/${boardId}/archive`, archived, {
            headers: { "Content-Type": "application/json" }
        });
        return response.data;
    } catch (error) {
        console.error("Error archiving board:", error);
        throw error;
    }
}
