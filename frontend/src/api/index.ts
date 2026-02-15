import axios from 'axios';
import type { Character, Message, CreateCharacterDto, Conversation, UserProfile } from '@/types';
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
  getHistory: (characterId: string, conversationId?: string) =>
    api.get<Message[]>(`/chat/history/${characterId}`, { params: { conversationId } }),
  clearHistory: (characterId: string, conversationId?: string) =>
    api.delete(`/chat/history/${characterId}`, { params: { conversationId } }),
};

// 对话相关API
export const conversationApi = {
  getAll: (params?: { characterId?: string; period?: string }) =>
    api.get<Conversation[]>('/conversations', { params }),
  getOne: (id: string) => api.get<Conversation>(`/conversations/${id}`),
  create: (data: { characterId: string; title?: string }) =>
    api.post<Conversation>('/conversations', data),
  updateTitle: (id: string, title: string) =>
    api.patch(`/conversations/${id}/title`, { title }),
  delete: (id: string) => api.delete(`/conversations/${id}`),
  getMessages: (id: string) => api.get<Message[]>(`/conversations/${id}/messages`),
};

// 用户信息相关API
export const userProfileApi = {
  get: () => api.get<UserProfile>('/user-profile'),
  upsert: (data: Partial<UserProfile>) => api.post<UserProfile>('/user-profile', data),
  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<{ avatarUrl: string }>('/user-profile/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
