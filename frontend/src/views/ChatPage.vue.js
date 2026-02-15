/// <reference types="../../node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Delete, User, ChatDotRound, Promotion, Lightning, MagicStick, Picture, Close } from '@element-plus/icons-vue';
import imageCompression from 'browser-image-compression';
import MessageCard from '@/components/MessageCard.vue';
import { useCharacterStore } from '@/stores/character';
import { useChatStore } from '@/stores/chat';
import { useDeviceStore } from '@/stores/device';
import { useUserProfileStore } from '@/stores/userProfile';
import { useConversationStore } from '@/stores/conversation';
const characterStore = useCharacterStore();
const chatStore = useChatStore();
const deviceStore = useDeviceStore();
const userProfileStore = useUserProfileStore();
const conversationStore = useConversationStore();
const currentCharacterId = ref('');
const isCreatingNew = ref(false);
const inputMessage = ref('');
const scrollbarRef = ref();
const selectedImage = ref(null);
const uploadRef = ref();
const availableModels = ref([]);
const abortController = ref(null);
const selectRequestId = ref(0);
let scrollPending = false; // 滚动节流标志
onMounted(async () => {
    // 获取角色列表
    await characterStore.fetchCharacters();
    // 获取用户配置
    await userProfileStore.fetchProfile();
    // 自动选择默认模式
    let defaultCharacterId = userProfileStore.profile?.defaultModeId;
    // 如果没有配置默认模式，选择第一个预设模式
    if (!defaultCharacterId && characterStore.characters.length > 0) {
        const presetModes = characterStore.characters.filter(char => char.metadata?.isPreset === true);
        if (presetModes.length > 0) {
            defaultCharacterId = presetModes[0].id;
        }
    }
    // 自动进入对话
    if (defaultCharacterId) {
        await selectCharacter(defaultCharacterId);
    }
    // 获取可用模型列表
    try {
        const response = await fetch('/api/config/available-models');
        const result = await response.json();
        if (result.success && result.data.length > 0) {
            availableModels.value = result.data;
            // 如果当前选中的模型不在可用列表中，切换到第一个可用模型
            const currentModel = chatStore.aiModel;
            const isCurrentModelAvailable = result.data.some((m) => m.value === currentModel);
            if (!isCurrentModelAvailable) {
                chatStore.aiModel = result.data[0].value;
            }
        }
    }
    catch (error) {
        console.error('获取可用模型失败:', error);
        ElMessage.error('获取可用模型失败');
    }
});
// 监听对话选择变化，自动加载消息历史
watch(() => conversationStore.currentConversation, async (newConversation, oldConversation) => {
    // 优先处理清空会话的情况
    if (newConversation === null) {
        chatStore.messages = [];
        chatStore.currentConversationId = undefined;
        isCreatingNew.value = true;
        return;
    }
    // 处理会话切换
    if (newConversation && newConversation.id !== oldConversation?.id) {
        // 取消正在进行的 SSE 请求
        if (abortController.value) {
            abortController.value.abort();
            chatStore.streaming = false;
        }
        // 更新当前角色和对话ID
        currentCharacterId.value = newConversation.characterId;
        chatStore.currentConversationId = newConversation.id;
        // 加载对话的消息历史
        await chatStore.fetchHistory(newConversation.characterId, newConversation.id);
        scrollToBottom();
    }
}, { immediate: true });
const selectCharacter = async (id) => {
    // 生成新的请求ID
    const requestId = ++selectRequestId.value;
    // 取消正在进行的 SSE 请求
    if (abortController.value) {
        abortController.value.abort();
        chatStore.streaming = false;
    }
    // 立即更新 UI，提供即时反馈
    currentCharacterId.value = id;
    chatStore.currentConversationId = undefined; // 重置对话ID
    try {
        // 并行执行两个请求以提高性能
        await Promise.all([
            characterStore.selectCharacter(id),
            chatStore.fetchHistory(id),
        ]);
        // 检查这是否还是最新的请求
        if (requestId !== selectRequestId.value) {
            // 如果不是最新请求，忽略结果
            return;
        }
        // 只有最新请求才会执行滚动
        scrollToBottom();
    }
    catch (error) {
        // 只有最新请求才显示错误
        if (requestId === selectRequestId.value) {
            ElMessage.error('切换角色失败');
        }
    }
};
const handleImageSelect = async (uploadFile) => {
    if (!uploadFile.raw)
        return;
    const file = uploadFile.raw;
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
        ElMessage.warning('图片大小不能超过5MB');
        return;
    }
    try {
        // 压缩图片
        const compressedFile = await imageCompression(file, {
            maxWidthOrHeight: 1920,
            maxSizeMB: 1,
            useWebWorker: true,
        });
        // 创建预览URL
        const preview = URL.createObjectURL(compressedFile);
        selectedImage.value = { file: compressedFile, preview };
    }
    catch (error) {
        ElMessage.error('图片处理失败');
    }
};
const removeImage = () => {
    if (selectedImage.value) {
        URL.revokeObjectURL(selectedImage.value.preview);
        selectedImage.value = null;
    }
    if (uploadRef.value) {
        uploadRef.value.clearFiles();
    }
};
const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
    });
    if (!response.ok) {
        throw new Error('图片上传失败');
    }
    const result = await response.json();
    return result.data.url;
};
const sendMessage = async () => {
    if ((!inputMessage.value.trim() && !selectedImage.value) || chatStore.streaming)
        return;
    const content = inputMessage.value.trim() || '请看这张图片';
    let imageUrl;
    // 如果有图片，先上传
    if (selectedImage.value) {
        try {
            imageUrl = await uploadImage(selectedImage.value.file);
        }
        catch (error) {
            ElMessage.error('图片上传失败');
            return;
        }
    }
    inputMessage.value = '';
    removeImage();
    // 添加用户消息（包含图片）
    chatStore.addUserMessage(content, currentCharacterId.value, imageUrl);
    scrollToBottom();
    // 准备AI回复
    chatStore.addAssistantMessage('', currentCharacterId.value);
    chatStore.streaming = true;
    // 创建新的 AbortController
    if (abortController.value) {
        abortController.value.abort();
    }
    abortController.value = new AbortController();
    // 设置超时检测（60秒）
    const timeoutId = setTimeout(() => {
        if (chatStore.streaming) {
            abortController.value?.abort();
            ElMessage.warning('请求超时，请检查网络连接或稍后重试');
            chatStore.streaming = false;
        }
    }, 60000);
    try {
        const response = await fetch('/api/chat/stream', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Device-Id': deviceStore.deviceId,
            },
            body: JSON.stringify({
                characterId: currentCharacterId.value,
                content,
                conversationId: isCreatingNew.value ? undefined : chatStore.currentConversationId,
                imageUrl,
                model: chatStore.aiModel
            }),
            signal: abortController.value.signal,
        });
        if (!response.body)
            throw new Error('No response body');
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let assistantContent = '';
        while (true) {
            const { done, value } = await reader.read();
            if (done)
                break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n\n');
            buffer = lines.pop() || '';
            for (const line of lines) {
                if (!line.trim())
                    continue;
                const [eventLine, dataLine] = line.split('\n');
                if (!eventLine?.startsWith('event:') || !dataLine?.startsWith('data:'))
                    continue;
                const event = eventLine.substring(6).trim();
                const data = JSON.parse(dataLine.substring(5).trim());
                if (event === 'start') {
                    // 接收conversation对象
                    if (data.conversation) {
                        chatStore.currentConversationId = data.conversation.id;
                        isCreatingNew.value = false;
                        // 直接添加到对话列表开头
                        const existingIndex = conversationStore.conversations.findIndex(c => c.id === data.conversation.id);
                        if (existingIndex === -1) {
                            conversationStore.conversations.unshift(data.conversation);
                        }
                    }
                }
                else if (event === 'token') {
                    assistantContent += data.content;
                    chatStore.updateLastMessage(assistantContent);
                    scrollToBottom();
                }
                else if (event === 'error') {
                    throw new Error(data.error);
                }
            }
        }
    }
    catch (error) {
        // 区分用户主动取消和真实错误
        if (error.name === 'AbortError') {
            // 用户主动取消，不显示错误
            console.log('请求已取消');
        }
        else {
            ElMessage.error(error.message || '发送消息失败');
        }
    }
    finally {
        clearTimeout(timeoutId);
        chatStore.streaming = false;
        abortController.value = null;
    }
};
const clearChat = async () => {
    try {
        await ElMessageBox.confirm('确认清空当前对话？', '提示', {
            confirmButtonText: '确认',
            cancelButtonText: '取消',
            type: 'warning',
        });
        // 取消正在进行的 SSE 请求
        if (abortController.value) {
            abortController.value.abort();
            chatStore.streaming = false;
        }
        await chatStore.clearHistory(currentCharacterId.value, chatStore.currentConversationId);
        if (chatStore.currentConversationId) {
            // 从列表中移除对话
            conversationStore.conversations = conversationStore.conversations.filter(c => c.id !== chatStore.currentConversationId);
            // 清空当前对话选择
            conversationStore.currentConversation = null;
            // 重置本地状态
            chatStore.currentConversationId = undefined;
        }
        ElMessage.success('清空成功');
    }
    catch {
        // 用户取消
    }
};
const scrollToBottom = () => {
    if (scrollPending)
        return;
    scrollPending = true;
    requestAnimationFrame(() => {
        nextTick(() => {
            if (scrollbarRef.value) {
                scrollbarRef.value.setScrollTop(999999);
            }
            scrollPending = false;
        });
    });
};
onUnmounted(() => {
    // 取消正在进行的 SSE 请求
    if (abortController.value) {
        abortController.value.abort();
    }
    // 清理图片预览URL
    if (selectedImage.value) {
        URL.revokeObjectURL(selectedImage.value.preview);
    }
});
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['message-item']} */ ;
/** @type {__VLS_StyleScopedClasses['message-item']} */ ;
/** @type {__VLS_StyleScopedClasses['user']} */ ;
/** @type {__VLS_StyleScopedClasses['message-content']} */ ;
/** @type {__VLS_StyleScopedClasses['message-item']} */ ;
/** @type {__VLS_StyleScopedClasses['message-content']} */ ;
/** @type {__VLS_StyleScopedClasses['input-box']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "chat-page" },
});
/** @type {__VLS_StyleScopedClasses['chat-page']} */ ;
let __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.elContainer | typeof __VLS_components.ElContainer | typeof __VLS_components.elContainer | typeof __VLS_components.ElContainer} */
elContainer;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    ...{ style: {} },
}));
const __VLS_2 = __VLS_1({
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
const { default: __VLS_5 } = __VLS_3.slots;
let __VLS_6;
/** @ts-ignore @type {typeof __VLS_components.elContainer | typeof __VLS_components.ElContainer | typeof __VLS_components.elContainer | typeof __VLS_components.ElContainer} */
elContainer;
// @ts-ignore
const __VLS_7 = __VLS_asFunctionalComponent1(__VLS_6, new __VLS_6({
    ...{ class: "chat-container" },
}));
const __VLS_8 = __VLS_7({
    ...{ class: "chat-container" },
}, ...__VLS_functionalComponentArgsRest(__VLS_7));
/** @type {__VLS_StyleScopedClasses['chat-container']} */ ;
const { default: __VLS_11 } = __VLS_9.slots;
if (__VLS_ctx.currentCharacterId) {
    let __VLS_12;
    /** @ts-ignore @type {typeof __VLS_components.elHeader | typeof __VLS_components.ElHeader | typeof __VLS_components.elHeader | typeof __VLS_components.ElHeader} */
    elHeader;
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent1(__VLS_12, new __VLS_12({
        height: "70px",
        ...{ class: "chat-header-container" },
    }));
    const __VLS_14 = __VLS_13({
        height: "70px",
        ...{ class: "chat-header-container" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_13));
    /** @type {__VLS_StyleScopedClasses['chat-header-container']} */ ;
    const { default: __VLS_17 } = __VLS_15.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "chat-header" },
    });
    /** @type {__VLS_StyleScopedClasses['chat-header']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "header-left" },
    });
    /** @type {__VLS_StyleScopedClasses['header-left']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "header-hint" },
    });
    /** @type {__VLS_StyleScopedClasses['header-hint']} */ ;
    let __VLS_18;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_19 = __VLS_asFunctionalComponent1(__VLS_18, new __VLS_18({
        ...{ 'onClick': {} },
        text: true,
    }));
    const __VLS_20 = __VLS_19({
        ...{ 'onClick': {} },
        text: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_19));
    let __VLS_23;
    const __VLS_24 = ({ click: {} },
        { onClick: (__VLS_ctx.clearChat) });
    const { default: __VLS_25 } = __VLS_21.slots;
    let __VLS_26;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_27 = __VLS_asFunctionalComponent1(__VLS_26, new __VLS_26({
        ...{ style: {} },
    }));
    const __VLS_28 = __VLS_27({
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_27));
    const { default: __VLS_31 } = __VLS_29.slots;
    let __VLS_32;
    /** @ts-ignore @type {typeof __VLS_components.Delete} */
    Delete;
    // @ts-ignore
    const __VLS_33 = __VLS_asFunctionalComponent1(__VLS_32, new __VLS_32({}));
    const __VLS_34 = __VLS_33({}, ...__VLS_functionalComponentArgsRest(__VLS_33));
    // @ts-ignore
    [currentCharacterId, clearChat,];
    var __VLS_29;
    // @ts-ignore
    [];
    var __VLS_21;
    var __VLS_22;
    // @ts-ignore
    [];
    var __VLS_15;
    let __VLS_37;
    /** @ts-ignore @type {typeof __VLS_components.elMain | typeof __VLS_components.ElMain | typeof __VLS_components.elMain | typeof __VLS_components.ElMain} */
    elMain;
    // @ts-ignore
    const __VLS_38 = __VLS_asFunctionalComponent1(__VLS_37, new __VLS_37({
        ...{ class: "chat-main" },
    }));
    const __VLS_39 = __VLS_38({
        ...{ class: "chat-main" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_38));
    /** @type {__VLS_StyleScopedClasses['chat-main']} */ ;
    const { default: __VLS_42 } = __VLS_40.slots;
    let __VLS_43;
    /** @ts-ignore @type {typeof __VLS_components.elScrollbar | typeof __VLS_components.ElScrollbar | typeof __VLS_components.elScrollbar | typeof __VLS_components.ElScrollbar} */
    elScrollbar;
    // @ts-ignore
    const __VLS_44 = __VLS_asFunctionalComponent1(__VLS_43, new __VLS_43({
        ref: "scrollbarRef",
        height: "100%",
    }));
    const __VLS_45 = __VLS_44({
        ref: "scrollbarRef",
        height: "100%",
    }, ...__VLS_functionalComponentArgsRest(__VLS_44));
    var __VLS_48 = {};
    const { default: __VLS_50 } = __VLS_46.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "message-list" },
    });
    /** @type {__VLS_StyleScopedClasses['message-list']} */ ;
    for (const [msg] of __VLS_vFor((__VLS_ctx.chatStore.messages))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            key: (msg.id),
            ...{ class: "message-item" },
            ...{ class: (msg.role) },
        });
        /** @type {__VLS_StyleScopedClasses['message-item']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "message-avatar" },
        });
        /** @type {__VLS_StyleScopedClasses['message-avatar']} */ ;
        if (msg.role === 'user') {
            let __VLS_51;
            /** @ts-ignore @type {typeof __VLS_components.elAvatar | typeof __VLS_components.ElAvatar | typeof __VLS_components.elAvatar | typeof __VLS_components.ElAvatar} */
            elAvatar;
            // @ts-ignore
            const __VLS_52 = __VLS_asFunctionalComponent1(__VLS_51, new __VLS_51({
                size: (36),
            }));
            const __VLS_53 = __VLS_52({
                size: (36),
            }, ...__VLS_functionalComponentArgsRest(__VLS_52));
            const { default: __VLS_56 } = __VLS_54.slots;
            let __VLS_57;
            /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
            elIcon;
            // @ts-ignore
            const __VLS_58 = __VLS_asFunctionalComponent1(__VLS_57, new __VLS_57({}));
            const __VLS_59 = __VLS_58({}, ...__VLS_functionalComponentArgsRest(__VLS_58));
            const { default: __VLS_62 } = __VLS_60.slots;
            let __VLS_63;
            /** @ts-ignore @type {typeof __VLS_components.User} */
            User;
            // @ts-ignore
            const __VLS_64 = __VLS_asFunctionalComponent1(__VLS_63, new __VLS_63({}));
            const __VLS_65 = __VLS_64({}, ...__VLS_functionalComponentArgsRest(__VLS_64));
            // @ts-ignore
            [chatStore,];
            var __VLS_60;
            // @ts-ignore
            [];
            var __VLS_54;
        }
        else {
            let __VLS_68;
            /** @ts-ignore @type {typeof __VLS_components.elAvatar | typeof __VLS_components.ElAvatar | typeof __VLS_components.elAvatar | typeof __VLS_components.ElAvatar} */
            elAvatar;
            // @ts-ignore
            const __VLS_69 = __VLS_asFunctionalComponent1(__VLS_68, new __VLS_68({
                size: (36),
                ...{ style: {} },
            }));
            const __VLS_70 = __VLS_69({
                size: (36),
                ...{ style: {} },
            }, ...__VLS_functionalComponentArgsRest(__VLS_69));
            const { default: __VLS_73 } = __VLS_71.slots;
            let __VLS_74;
            /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
            elIcon;
            // @ts-ignore
            const __VLS_75 = __VLS_asFunctionalComponent1(__VLS_74, new __VLS_74({}));
            const __VLS_76 = __VLS_75({}, ...__VLS_functionalComponentArgsRest(__VLS_75));
            const { default: __VLS_79 } = __VLS_77.slots;
            let __VLS_80;
            /** @ts-ignore @type {typeof __VLS_components.ChatDotRound} */
            ChatDotRound;
            // @ts-ignore
            const __VLS_81 = __VLS_asFunctionalComponent1(__VLS_80, new __VLS_80({}));
            const __VLS_82 = __VLS_81({}, ...__VLS_functionalComponentArgsRest(__VLS_81));
            // @ts-ignore
            [];
            var __VLS_77;
            // @ts-ignore
            [];
            var __VLS_71;
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "message-content" },
        });
        /** @type {__VLS_StyleScopedClasses['message-content']} */ ;
        const __VLS_85 = MessageCard;
        // @ts-ignore
        const __VLS_86 = __VLS_asFunctionalComponent1(__VLS_85, new __VLS_85({
            content: (msg.content),
            metadata: (msg.metadata),
            isStreaming: (__VLS_ctx.chatStore.streaming && msg === __VLS_ctx.chatStore.messages[__VLS_ctx.chatStore.messages.length - 1]),
        }));
        const __VLS_87 = __VLS_86({
            content: (msg.content),
            metadata: (msg.metadata),
            isStreaming: (__VLS_ctx.chatStore.streaming && msg === __VLS_ctx.chatStore.messages[__VLS_ctx.chatStore.messages.length - 1]),
        }, ...__VLS_functionalComponentArgsRest(__VLS_86));
        // @ts-ignore
        [chatStore, chatStore, chatStore,];
    }
    // @ts-ignore
    [];
    var __VLS_46;
    // @ts-ignore
    [];
    var __VLS_40;
    let __VLS_90;
    /** @ts-ignore @type {typeof __VLS_components.elFooter | typeof __VLS_components.ElFooter | typeof __VLS_components.elFooter | typeof __VLS_components.ElFooter} */
    elFooter;
    // @ts-ignore
    const __VLS_91 = __VLS_asFunctionalComponent1(__VLS_90, new __VLS_90({
        height: "auto",
        ...{ class: "chat-footer" },
    }));
    const __VLS_92 = __VLS_91({
        height: "auto",
        ...{ class: "chat-footer" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_91));
    /** @type {__VLS_StyleScopedClasses['chat-footer']} */ ;
    const { default: __VLS_95 } = __VLS_93.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "model-selector" },
    });
    /** @type {__VLS_StyleScopedClasses['model-selector']} */ ;
    let __VLS_96;
    /** @ts-ignore @type {typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect} */
    elSelect;
    // @ts-ignore
    const __VLS_97 = __VLS_asFunctionalComponent1(__VLS_96, new __VLS_96({
        modelValue: (__VLS_ctx.chatStore.aiModel),
        size: "small",
        ...{ style: {} },
        placeholder: "选择模型",
    }));
    const __VLS_98 = __VLS_97({
        modelValue: (__VLS_ctx.chatStore.aiModel),
        size: "small",
        ...{ style: {} },
        placeholder: "选择模型",
    }, ...__VLS_functionalComponentArgsRest(__VLS_97));
    const { default: __VLS_101 } = __VLS_99.slots;
    for (const [model] of __VLS_vFor((__VLS_ctx.availableModels))) {
        let __VLS_102;
        /** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
        elOption;
        // @ts-ignore
        const __VLS_103 = __VLS_asFunctionalComponent1(__VLS_102, new __VLS_102({
            key: (model.value),
            value: (model.value),
            label: (model.label),
        }));
        const __VLS_104 = __VLS_103({
            key: (model.value),
            value: (model.value),
            label: (model.label),
        }, ...__VLS_functionalComponentArgsRest(__VLS_103));
        const { default: __VLS_107 } = __VLS_105.slots;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ style: {} },
        });
        let __VLS_108;
        /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
        elIcon;
        // @ts-ignore
        const __VLS_109 = __VLS_asFunctionalComponent1(__VLS_108, new __VLS_108({
            ...{ style: {} },
        }));
        const __VLS_110 = __VLS_109({
            ...{ style: {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_109));
        const { default: __VLS_113 } = __VLS_111.slots;
        if (model.icon === 'lightning') {
            let __VLS_114;
            /** @ts-ignore @type {typeof __VLS_components.Lightning} */
            Lightning;
            // @ts-ignore
            const __VLS_115 = __VLS_asFunctionalComponent1(__VLS_114, new __VLS_114({}));
            const __VLS_116 = __VLS_115({}, ...__VLS_functionalComponentArgsRest(__VLS_115));
        }
        else {
            let __VLS_119;
            /** @ts-ignore @type {typeof __VLS_components.MagicStick} */
            MagicStick;
            // @ts-ignore
            const __VLS_120 = __VLS_asFunctionalComponent1(__VLS_119, new __VLS_119({}));
            const __VLS_121 = __VLS_120({}, ...__VLS_functionalComponentArgsRest(__VLS_120));
        }
        // @ts-ignore
        [chatStore, availableModels,];
        var __VLS_111;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        (model.label);
        // @ts-ignore
        [];
        var __VLS_105;
        // @ts-ignore
        [];
    }
    // @ts-ignore
    [];
    var __VLS_99;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "input-area" },
    });
    /** @type {__VLS_StyleScopedClasses['input-area']} */ ;
    if (__VLS_ctx.selectedImage) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "image-preview" },
        });
        /** @type {__VLS_StyleScopedClasses['image-preview']} */ ;
        let __VLS_124;
        /** @ts-ignore @type {typeof __VLS_components.elImage | typeof __VLS_components.ElImage} */
        elImage;
        // @ts-ignore
        const __VLS_125 = __VLS_asFunctionalComponent1(__VLS_124, new __VLS_124({
            src: (__VLS_ctx.selectedImage.preview),
            fit: "cover",
            ...{ class: "preview-image" },
        }));
        const __VLS_126 = __VLS_125({
            src: (__VLS_ctx.selectedImage.preview),
            fit: "cover",
            ...{ class: "preview-image" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_125));
        /** @type {__VLS_StyleScopedClasses['preview-image']} */ ;
        let __VLS_129;
        /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
        elButton;
        // @ts-ignore
        const __VLS_130 = __VLS_asFunctionalComponent1(__VLS_129, new __VLS_129({
            ...{ 'onClick': {} },
            type: "danger",
            size: "small",
            circle: true,
            ...{ class: "remove-image-btn" },
        }));
        const __VLS_131 = __VLS_130({
            ...{ 'onClick': {} },
            type: "danger",
            size: "small",
            circle: true,
            ...{ class: "remove-image-btn" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_130));
        let __VLS_134;
        const __VLS_135 = ({ click: {} },
            { onClick: (__VLS_ctx.removeImage) });
        /** @type {__VLS_StyleScopedClasses['remove-image-btn']} */ ;
        const { default: __VLS_136 } = __VLS_132.slots;
        let __VLS_137;
        /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
        elIcon;
        // @ts-ignore
        const __VLS_138 = __VLS_asFunctionalComponent1(__VLS_137, new __VLS_137({}));
        const __VLS_139 = __VLS_138({}, ...__VLS_functionalComponentArgsRest(__VLS_138));
        const { default: __VLS_142 } = __VLS_140.slots;
        let __VLS_143;
        /** @ts-ignore @type {typeof __VLS_components.Close} */
        Close;
        // @ts-ignore
        const __VLS_144 = __VLS_asFunctionalComponent1(__VLS_143, new __VLS_143({}));
        const __VLS_145 = __VLS_144({}, ...__VLS_functionalComponentArgsRest(__VLS_144));
        // @ts-ignore
        [selectedImage, selectedImage, removeImage,];
        var __VLS_140;
        // @ts-ignore
        [];
        var __VLS_132;
        var __VLS_133;
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "input-row" },
    });
    /** @type {__VLS_StyleScopedClasses['input-row']} */ ;
    let __VLS_148;
    /** @ts-ignore @type {typeof __VLS_components.elUpload | typeof __VLS_components.ElUpload | typeof __VLS_components.elUpload | typeof __VLS_components.ElUpload} */
    elUpload;
    // @ts-ignore
    const __VLS_149 = __VLS_asFunctionalComponent1(__VLS_148, new __VLS_148({
        ref: "uploadRef",
        autoUpload: (false),
        showFileList: (false),
        accept: "image/*",
        onChange: (__VLS_ctx.handleImageSelect),
    }));
    const __VLS_150 = __VLS_149({
        ref: "uploadRef",
        autoUpload: (false),
        showFileList: (false),
        accept: "image/*",
        onChange: (__VLS_ctx.handleImageSelect),
    }, ...__VLS_functionalComponentArgsRest(__VLS_149));
    var __VLS_153 = {};
    const { default: __VLS_155 } = __VLS_151.slots;
    let __VLS_156;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_157 = __VLS_asFunctionalComponent1(__VLS_156, new __VLS_156({
        circle: true,
        size: "large",
        ...{ class: "image-btn" },
    }));
    const __VLS_158 = __VLS_157({
        circle: true,
        size: "large",
        ...{ class: "image-btn" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_157));
    /** @type {__VLS_StyleScopedClasses['image-btn']} */ ;
    const { default: __VLS_161 } = __VLS_159.slots;
    let __VLS_162;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_163 = __VLS_asFunctionalComponent1(__VLS_162, new __VLS_162({}));
    const __VLS_164 = __VLS_163({}, ...__VLS_functionalComponentArgsRest(__VLS_163));
    const { default: __VLS_167 } = __VLS_165.slots;
    let __VLS_168;
    /** @ts-ignore @type {typeof __VLS_components.Picture} */
    Picture;
    // @ts-ignore
    const __VLS_169 = __VLS_asFunctionalComponent1(__VLS_168, new __VLS_168({}));
    const __VLS_170 = __VLS_169({}, ...__VLS_functionalComponentArgsRest(__VLS_169));
    // @ts-ignore
    [handleImageSelect,];
    var __VLS_165;
    // @ts-ignore
    [];
    var __VLS_159;
    // @ts-ignore
    [];
    var __VLS_151;
    let __VLS_173;
    /** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
    elInput;
    // @ts-ignore
    const __VLS_174 = __VLS_asFunctionalComponent1(__VLS_173, new __VLS_173({
        ...{ 'onKeydown': {} },
        modelValue: (__VLS_ctx.inputMessage),
        type: "textarea",
        rows: (4),
        placeholder: "输入消息... (Ctrl+Enter 发送)",
        ...{ class: "input-box" },
    }));
    const __VLS_175 = __VLS_174({
        ...{ 'onKeydown': {} },
        modelValue: (__VLS_ctx.inputMessage),
        type: "textarea",
        rows: (4),
        placeholder: "输入消息... (Ctrl+Enter 发送)",
        ...{ class: "input-box" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_174));
    let __VLS_178;
    const __VLS_179 = ({ keydown: {} },
        { onKeydown: (__VLS_ctx.sendMessage) });
    /** @type {__VLS_StyleScopedClasses['input-box']} */ ;
    var __VLS_176;
    var __VLS_177;
    let __VLS_180;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_181 = __VLS_asFunctionalComponent1(__VLS_180, new __VLS_180({
        ...{ 'onClick': {} },
        type: "primary",
        circle: true,
        size: "large",
        ...{ class: "send-btn" },
        loading: (__VLS_ctx.chatStore.streaming),
        disabled: (!__VLS_ctx.inputMessage.trim() && !__VLS_ctx.selectedImage),
    }));
    const __VLS_182 = __VLS_181({
        ...{ 'onClick': {} },
        type: "primary",
        circle: true,
        size: "large",
        ...{ class: "send-btn" },
        loading: (__VLS_ctx.chatStore.streaming),
        disabled: (!__VLS_ctx.inputMessage.trim() && !__VLS_ctx.selectedImage),
    }, ...__VLS_functionalComponentArgsRest(__VLS_181));
    let __VLS_185;
    const __VLS_186 = ({ click: {} },
        { onClick: (__VLS_ctx.sendMessage) });
    /** @type {__VLS_StyleScopedClasses['send-btn']} */ ;
    const { default: __VLS_187 } = __VLS_183.slots;
    if (!__VLS_ctx.chatStore.streaming) {
        let __VLS_188;
        /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
        elIcon;
        // @ts-ignore
        const __VLS_189 = __VLS_asFunctionalComponent1(__VLS_188, new __VLS_188({}));
        const __VLS_190 = __VLS_189({}, ...__VLS_functionalComponentArgsRest(__VLS_189));
        const { default: __VLS_193 } = __VLS_191.slots;
        let __VLS_194;
        /** @ts-ignore @type {typeof __VLS_components.Promotion} */
        Promotion;
        // @ts-ignore
        const __VLS_195 = __VLS_asFunctionalComponent1(__VLS_194, new __VLS_194({}));
        const __VLS_196 = __VLS_195({}, ...__VLS_functionalComponentArgsRest(__VLS_195));
        // @ts-ignore
        [chatStore, chatStore, selectedImage, inputMessage, inputMessage, sendMessage, sendMessage,];
        var __VLS_191;
    }
    // @ts-ignore
    [];
    var __VLS_183;
    var __VLS_184;
    // @ts-ignore
    [];
    var __VLS_93;
}
// @ts-ignore
[];
var __VLS_9;
// @ts-ignore
[];
var __VLS_3;
// @ts-ignore
var __VLS_49 = __VLS_48, __VLS_154 = __VLS_153;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
