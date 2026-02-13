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
    getHistory: (characterId) => api.get(`/chat/history/${characterId}`),
    clearHistory: (characterId) => api.delete(`/chat/history/${characterId}`),
};
