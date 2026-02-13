import axios from 'axios';
import type { Character, Message, CreateCharacterDto } from '@/types';
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
  getAll: () => api.get<Character[]>('/characters'),
  getOne: (id: string) => api.get<Character>(`/characters/${id}`),
  create: (data: CreateCharacterDto) => api.post<Character>('/characters', data),
  delete: (id: string) => api.delete(`/characters/${id}`),
};

// 聊天相关API
export const chatApi = {
  getHistory: (characterId: string) => api.get<Message[]>(`/chat/history/${characterId}`),
  clearHistory: (characterId: string) => api.delete(`/chat/history/${characterId}`),
};
