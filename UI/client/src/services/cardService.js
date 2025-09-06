import axios from "axios";

const API_URL = "http://localhost:5035/api/cards";

// Yeni card oluştur
export async function createCard({ listId, title, description = "", dueDate = null, assignedUserId = null }) {
    try {
        const response = await axios.post(API_URL, { listId, title, description, dueDate, assignedUserId });
        return response.data;
    } catch (error) {
        console.error("Error creating card:", error);
        throw error;
    }
}

// ID’ye göre card getir
export async function getCardById(cardId) {
    try {
        const response = await axios.get(`${API_URL}/${cardId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching card:", error);
        throw error;
    }
}

// ListId’ye göre card getir
export async function getCardsByListId(listId) {
    try {
        const response = await axios.get(`${API_URL}/list/${listId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching cards:", error);
        throw error;
    }
}

// Card güncelle
export async function updateCard(card) {
    try {
        const { id, ...cardData } = card;
        const response = await axios.put(`${API_URL}/${id}`, cardData);
        return response.data;
    } catch (error) {
        console.error("Error updating card:", error);
        throw error;
    }
}

// Card sil
export async function deleteCard(cardId) {
    try {
        await axios.delete(`${API_URL}/${cardId}`);
        return true;
    } catch (error) {
        console.error("Error deleting card:", error);
        throw error;
    }
}

// Card tamamlandı işaretle
export async function completeCard(cardId, isCompleted = true) {
    try {
        const response = await axios.put(`${API_URL}/${cardId}/complete`, { isCompleted });
        return response.data;
    } catch (error) {
        console.error("Error completing card:", error);
        throw error;
    }
}

// Card taşı (list değiştir)
export async function moveCard(cardId, newListId) {
    try {
        const response = await axios.put(`${API_URL}/${cardId}/move`, { listId: newListId });
        return response.data;
    } catch (error) {
        console.error("Error moving card:", error);
        throw error;
    }
}
