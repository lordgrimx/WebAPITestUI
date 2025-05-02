// filepath: d:\Projects\WebAPITestUI-semih.net1\client\lib\api\faq-api.js
import { authAxios } from '@/lib/auth-context';

export async function getFaqs() {
    const response = await authAxios.get('/faq');
    return response.data;
}

export async function getFaqsByCategory(category) {
    const response = await authAxios.get(`${API_URL}/faq/category/${category}`);
    return response.data;
}

export async function getFaqById(id) {
    const response = await authAxios.get(`${API_URL}/faq/${id}`);
    return response.data;
}

// Admin functions
export async function createFaq(faqData) {
    const response = await authAxios.post(`${API_URL}/faq`, faqData);
    return response.data;
}

export async function updateFaq(id, faqData) {
    const response = await authAxios.put(`${API_URL}/faq/${id}`, faqData);
    return response.data;
}

export async function deleteFaq(id) {
    await authAxios.delete(`${API_URL}/faq/${id}`);
    return true;
}
