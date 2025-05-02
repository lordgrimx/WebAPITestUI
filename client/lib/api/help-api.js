// filepath: d:\Projects\WebAPITestUI-semih.net1\client\lib\api\help-api.js
import { authAxios } from '@/lib/auth-context';

export async function getHelpDocuments() {
    const response = await authAxios.get('/helpdocument');
    return response.data;
}

export async function getHelpDocumentsByCategory(category) {
    const response = await authAxios.get(`/helpdocument/category/${encodeURIComponent(category)}`);
    return response.data;
}

export async function getHelpDocumentById(id) {
    const response = await authAxios.get(`${API_URL}/helpdocument/${id}`);
    return response.data;
}

// Admin functions
export async function createHelpDocument(documentData) {
    const response = await authAxios.post(`${API_URL}/helpdocument`, documentData);
    return response.data;
}

export async function updateHelpDocument(id, documentData) {
    const response = await authAxios.put(`${API_URL}/helpdocument/${id}`, documentData);
    return response.data;
}

export async function deleteHelpDocument(id) {
    await authAxios.delete(`${API_URL}/helpdocument/${id}`);
    return true;
}
