import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Message } from '@/types';
import { chatApi } from '@/api';

export const useChatStore = defineStore('chat', () => {
  const messages = ref<Message[]>([]);
  const loading = ref(false);
  const streaming = ref(false);
  const aiModel = ref<'gpt-4o' | 'gpt-4-vision-preview' | 'deepseek-chat' | 'deepseek-reasoner' | 'step-3' | 'step-r1-v-mini' | 'step-3.5-flash'>('gpt-4o');
  const messagesCache = ref<Map<string, Message[]>>(new Map());  // 消息缓存
  const currentCharacterId = ref<string>('');  // 当前角色ID

  const fetchHistory = async (characterId: string) => {
    // 检查缓存
    if (messagesCache.value.has(characterId)) {
      messages.value = messagesCache.value.get(characterId)!;
      currentCharacterId.value = characterId;
      return;
    }

    // 请求并缓存
    loading.value = true;
    try {
      const response = await chatApi.getHistory(characterId);
      messagesCache.value.set(characterId, response.data);
      messages.value = response.data;
      currentCharacterId.value = characterId;
    } finally {
      loading.value = false;
    }
  };

  const clearHistory = async (characterId: string) => {
    loading.value = true;
    try {
      await chatApi.clearHistory(characterId);
      messages.value = [];
      // 清除缓存
      messagesCache.value.delete(characterId);
    } finally {
      loading.value = false;
    }
  };

  const addUserMessage = (content: string, characterId: string, imageUrl?: string) => {
    const message: Message = {
      id: Date.now().toString(),
      characterId,
      role: 'user',
      content,
      metadata: imageUrl ? { imageUrl } : null,
      createdAt: new Date().toISOString(),
    };
    messages.value.push(message);
    // 同步更新缓存
    messagesCache.value.set(characterId, [...messages.value]);
    return message;
  };

  const addAssistantMessage = (content: string, characterId: string) => {
    const message: Message = {
      id: Date.now().toString(),
      characterId,
      role: 'assistant',
      content,
      metadata: null,
      createdAt: new Date().toISOString(),
    };
    messages.value.push(message);
    // 同步更新缓存
    messagesCache.value.set(characterId, [...messages.value]);
    return message;
  };

  const updateLastMessage = (content: string) => {
    if (messages.value.length > 0) {
      messages.value[messages.value.length - 1].content = content;
      // 同步更新缓存
      if (currentCharacterId.value) {
        messagesCache.value.set(currentCharacterId.value, [...messages.value]);
      }
    }
  };

  return {
    messages,
    loading,
    streaming,
    aiModel,
    fetchHistory,
    clearHistory,
    addUserMessage,
    addAssistantMessage,
    updateLastMessage,
  };
});
