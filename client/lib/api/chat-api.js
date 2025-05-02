// filepath: d:\Projects\WebAPITestUI-semih.net1\client\lib\api\chat-api.js
import { authAxios } from '@/lib/auth-context';

export async function createChatMessage(messageData) {
    const response = await authAxios.post('/chat/message', messageData);
    return response.data;
}

export async function getChatSessions() {
    const response = await authAxios.get('/chat/sessions');
    return response.data;
}

export async function getSessionMessages(sessionId) {
    const response = await authAxios.get(`/chat/sessions/${sessionId}`);
    return response.data;
}

export async function getAiCompletion(completionRequest) {
    const response = await authAxios.post('/chat/completion', completionRequest);
    return response.data;
}

export async function deleteSession(sessionId) {
    await authAxios.delete(`/chat/sessions/${sessionId}`);
    return true;
}

// Generate a new session ID
export function generateSessionId() {
    return 'session-' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
