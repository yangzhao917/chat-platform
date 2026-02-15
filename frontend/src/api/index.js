import axios from 'axios';
import { useDeviceStore } from '@/stores/device';
const api = axios.create({
    baseURL: '/api',
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});
// 请求拦截器：自动添加设备ID
api.interceptors.request.use((config) => {
    const deviceStore = useDeviceStore();
    if (deviceStore.deviceId) {
        config.headers['X-Device-Id'] = deviceStore.deviceId;
    }
    return config;
});
// 角色相关API
export const characterApi = {
    getAll: () => api.get('/characters'),
    getOne: (id) => api.get(`/characters/${id}`),
    create: (data) => api.post('/characters', data),
    delete: (id) => api.delete(`/characters/${id}`),
};
// 聊天相关API
export const chatApi = {
    getHistory: (characterId, conversationId) => api.get(`/chat/history/${characterId}`, { params: { conversationId } }),
    clearHistory: (characterId, conversationId) => api.delete(`/chat/history/${characterId}`, { params: { conversationId } }),
};
// 对话相关API
export const conversationApi = {
    getAll: (params) => api.get('/conversations', { params }),
    getOne: (id) => api.get(`/conversations/${id}`),
    create: (data) => api.post('/conversations', data),
    updateTitle: (id, title) => api.patch(`/conversations/${id}/title`, { title }),
    delete: (id) => api.delete(`/conversations/${id}`),
    getMessages: (id) => api.get(`/conversations/${id}/messages`),
};
// 用户信息相关API
export const userProfileApi = {
    get: () => api.get('/user-profile'),
    upsert: (data) => api.post('/user-profile', data),
    uploadAvatar: (file) => {
        const formData = new FormData();
        formData.append('file', file);
        return api.post('/user-profile/avatar', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },
};
