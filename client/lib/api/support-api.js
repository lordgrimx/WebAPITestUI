// filepath: d:\Projects\WebAPITestUI-semih.net1\client\lib\api\support-api.js
import { authAxios } from '@/lib/auth-context';

export async function getMyTickets() {
    const response = await authAxios.get('/supportticket/my');
    return response.data;
}

export async function getTicketById(id) {
    const response = await authAxios.get(`/supportticket/${id}`);
    return response.data;
}

export async function createTicket(ticketData) {
    const response = await authAxios.post('/supportticket', ticketData);
    return response.data;
}

export async function addReplyToTicket(ticketId, replyData) {
    const response = await authAxios.post(`/supportticket/${ticketId}/reply`, replyData);
    return response.data;
}

// Admin/support functions
export async function getAllTickets() {
    const response = await authAxios.get('/supportticket');
    return response.data;
}

export async function updateTicketStatus(ticketId, status) {
    const response = await authAxios.put(`/supportticket/${ticketId}/status`, JSON.stringify(status), {
        headers: {
            'Content-Type': 'application/json'
        }
    });
    return response.data;
}

export async function deleteTicket(id) {
    await authAxios.delete(`/supportticket/${id}`);
    return true;
}
