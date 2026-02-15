import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Conversation } from '@/types';
import { conversationApi } from '@/api';

export const useConversationStore = defineStore('conversation', () => {
  const conversations = ref<Conversation[]>([]);
  const currentConversation = ref<Conversation | null>(null);
  const loading = ref(false);

  const fetchConversations = async (characterId?: string, period?: string) => {
    loading.value = true;
    try {
      const response = await conversationApi.getAll({ characterId, period });
      conversations.value = response.data;
    } finally {
      loading.value = false;
    }
  };

  const selectConversation = async (id: string) => {
    loading.value = true;
    try {
      const response = await conversationApi.getOne(id);
      currentConversation.value = response.data;
    } finally {
      loading.value = false;
    }
  };

  const createConversation = async (data: { characterId: string; title?: string }) => {
    loading.value = true;
    try {
      const response = await conversationApi.create(data);
      conversations.value.unshift(response.data);
      return response.data;
    } finally {
      loading.value = false;
    }
  };

  const deleteConversation = async (id: string) => {
    loading.value = true;
    try {
      await conversationApi.delete(id);
      conversations.value = conversations.value.filter((c) => c.id !== id);
    } finally {
      loading.value = false;
    }
  };

  const clearCurrentConversation = () => {
    currentConversation.value = null;
  };

  const addConversation = (conversation: Conversation) => {
    const existingIndex = conversations.value.findIndex((c) => c.id === conversation.id);
    if (existingIndex === -1) {
      conversations.value.unshift(conversation);
    }
  };

  return {
    conversations,
    currentConversation,
    loading,
    fetchConversations,
    selectConversation,
    createConversation,
    deleteConversation,
    clearCurrentConversation,
    addConversation,
  };
});
