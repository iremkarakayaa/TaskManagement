import axios from "axios";

const API_URL = "http://localhost:5035/api/lists";

// Yeni liste oluştur
export async function createList({ boardId, name, order }) {
    try {
        const response = await axios.post(API_URL, { boardId, name, order });
        return response.data;
    } catch (error) {
        console.error("Error creating list:", error);
        throw error;
    }
}

// BoardId’ye göre tüm listeleri getir
export async function getListsByBoardId(boardId) {
    try {
        const response = await axios.get(`${API_URL}/board/${boardId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching lists:", error);
        throw error;
    }
}

// ListId’ye göre tek liste getir
export async function getListById(listId) {
    try {
        const response = await axios.get(`${API_URL}/${listId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching list:", error);
        throw error;
    }
}

// Liste güncelle
export async function updateList(id, { name, order }) {
    try {
        const response = await axios.put(`${API_URL}/${id}`, { name, order });
        return response.data;
    } catch (error) {
        console.error("Error updating list:", error);
        throw error;
    }
}

// Liste sil
export async function deleteList(id) {
    try {
        await axios.delete(`${API_URL}/${id}`);
        return true;
    } catch (error) {
        console.error("Error deleting list:", error);
        throw error;
    }
}
