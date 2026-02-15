import { defineStore } from 'pinia';
import { ref } from 'vue';
import { chatApi } from '@/api';
export const useChatStore = defineStore('chat', () => {
    const messages = ref([]);
    const loading = ref(false);
    const streaming = ref(false);
    const aiModel = ref('gpt-4o');
    const messagesCache = ref(new Map()); // 消息缓存
    const currentCharacterId = ref(''); // 当前角色ID
    const currentConversationId = ref(undefined); // 当前对话ID
    const fetchHistory = async (characterId, conversationId) => {
        const cacheKey = conversationId ? `${characterId}-${conversationId}` : `${characterId}-new`;
        // 检查缓存
        if (messagesCache.value.has(cacheKey)) {
            messages.value = messagesCache.value.get(cacheKey);
            currentCharacterId.value = characterId;
            return;
        }
        // 请求并缓存
        loading.value = true;
        try {
            const response = await chatApi.getHistory(characterId, conversationId);
            messagesCache.value.set(cacheKey, response.data);
            messages.value = response.data;
            currentCharacterId.value = characterId;
        }
        finally {
            loading.value = false;
        }
    };
    const clearHistory = async (characterId, conversationId) => {
        loading.value = true;
        try {
            await chatApi.clearHistory(characterId, conversationId);
            messages.value = [];
            // 清除缓存
            const cacheKey = conversationId ? `${characterId}-${conversationId}` : `${characterId}-new`;
            messagesCache.value.delete(cacheKey);
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
        // 同步更新缓存 - 使用完整的缓存键
        const cacheKey = currentConversationId.value
            ? `${characterId}-${currentConversationId.value}`
            : `${characterId}-new`;
        messagesCache.value.set(cacheKey, [...messages.value]);
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
        // 同步更新缓存 - 使用完整的缓存键
        const cacheKey = currentConversationId.value
            ? `${characterId}-${currentConversationId.value}`
            : `${characterId}-new`;
        messagesCache.value.set(cacheKey, [...messages.value]);
        return message;
    };
    const updateLastMessage = (content) => {
        if (messages.value.length > 0) {
            messages.value[messages.value.length - 1].content = content;
            // 同步更新缓存 - 使用完整的缓存键
            const lastMessage = messages.value[messages.value.length - 1];
            if (lastMessage.characterId) {
                const cacheKey = currentConversationId.value
                    ? `${lastMessage.characterId}-${currentConversationId.value}`
                    : `${lastMessage.characterId}-new`;
                messagesCache.value.set(cacheKey, [...messages.value]);
            }
        }
    };
    return {
        messages,
        loading,
        streaming,
        aiModel,
        currentConversationId,
        fetchHistory,
        clearHistory,
        addUserMessage,
        addAssistantMessage,
        updateLastMessage,
    };
});
