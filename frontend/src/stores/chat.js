import { defineStore } from 'pinia';
import { ref } from 'vue';
import { chatApi } from '@/api';
export const useChatStore = defineStore('chat', () => {
    const messages = ref([]);
    const loading = ref(false);
    const streaming = ref(false);
    const aiModel = ref('gpt-4o');
    const fetchHistory = async (characterId) => {
        loading.value = true;
        try {
            const response = await chatApi.getHistory(characterId);
            messages.value = response.data;
        }
        finally {
            loading.value = false;
        }
    };
    const clearHistory = async (characterId) => {
        loading.value = true;
        try {
            await chatApi.clearHistory(characterId);
            messages.value = [];
        }
        finally {
            loading.value = false;
        }
    };
    const addUserMessage = (content, characterId, imageUrl) => {
        const message = {
            id: Date.now().toString(),
            characterId,
            role: 'user',
            content,
            metadata: imageUrl ? { imageUrl } : null,
            createdAt: new Date().toISOString(),
        };
        messages.value.push(message);
        return message;
    };
    const addAssistantMessage = (content, characterId) => {
        const message = {
            id: Date.now().toString(),
            characterId,
            role: 'assistant',
            content,
            metadata: null,
            createdAt: new Date().toISOString(),
        };
        messages.value.push(message);
        return message;
    };
    const updateLastMessage = (content) => {
        if (messages.value.length > 0) {
            messages.value[messages.value.length - 1].content = content;
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
