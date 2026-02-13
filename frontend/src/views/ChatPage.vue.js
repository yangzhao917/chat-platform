/// <reference types="../../node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, onMounted, nextTick } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Delete, User, ChatDotRound, Promotion, Lightning, MagicStick, Picture, Close } from '@element-plus/icons-vue';
import imageCompression from 'browser-image-compression';
import MessageCard from '@/components/MessageCard.vue';
import { useCharacterStore } from '@/stores/character';
import { useChatStore } from '@/stores/chat';
import { useDeviceStore } from '@/stores/device';
const characterStore = useCharacterStore();
const chatStore = useChatStore();
const deviceStore = useDeviceStore();
const currentCharacterId = ref('');
const inputMessage = ref('');
const showCreateDialog = ref(false);
const scrollbarRef = ref();
const selectedImage = ref(null);
const uploadRef = ref();
const availableModels = ref([]);
const createForm = ref({
    name: '',
    description: '',
    backgroundStory: '',
});
onMounted(async () => {
    await characterStore.fetchCharacters();
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
    // 开发环境测试卡片渲染
    if (import.meta.env.DEV) {
        chatStore.messages.push({
            id: 'test-card-1',
            characterId: currentCharacterId.value || 'test',
            role: 'assistant',
            content: '这是您本月的水电费账单：',
            metadata: {
                renderType: 'card',
                cardType: 'utility-bill',
                cardData: {
                    title: '2024年2月水电费账单',
                    status: 'unpaid',
                    items: [
                        { label: '电费', value: '156.80', unit: '元', highlight: false },
                        { label: '水费', value: '45.20', unit: '元', highlight: false },
                        { label: '燃气费', value: '38.50', unit: '元', highlight: true },
                    ],
                    total: { label: '合计应付', value: '¥240.50' },
                    dueDate: '缴费截止日期：2024-03-15',
                },
            },
            createdAt: new Date().toISOString(),
        });
    }
});
const selectCharacter = async (id) => {
    currentCharacterId.value = id;
    await characterStore.selectCharacter(id);
    await chatStore.fetchHistory(id);
    scrollToBottom();
};
const deleteCharacter = async (id) => {
    try {
        await ElMessageBox.confirm('确认删除该角色？', '提示', {
            confirmButtonText: '确认',
            cancelButtonText: '取消',
            type: 'warning',
        });
        await characterStore.deleteCharacter(id);
        ElMessage.success('删除成功');
    }
    catch {
        // 用户取消
    }
};
const createCharacter = async () => {
    if (!createForm.value.name || !createForm.value.description || !createForm.value.backgroundStory) {
        ElMessage.warning('请填写完整信息');
        return;
    }
    try {
        await characterStore.createCharacter(createForm.value);
        ElMessage.success('创建成功');
        showCreateDialog.value = false;
        createForm.value = { name: '', description: '', backgroundStory: '' };
    }
    catch (error) {
        ElMessage.error('创建失败');
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
                imageUrl,
                model: chatStore.aiModel
            }),
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
                if (event === 'token') {
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
        ElMessage.error(error.message || '发送消息失败');
    }
    finally {
        chatStore.streaming = false;
    }
};
const clearChat = async () => {
    try {
        await ElMessageBox.confirm('确认清空对话记录？', '提示', {
            confirmButtonText: '确认',
            cancelButtonText: '取消',
            type: 'warning',
        });
        await chatStore.clearHistory(currentCharacterId.value);
        ElMessage.success('已清空对话');
    }
    catch {
        // 用户取消
    }
};
const scrollToBottom = () => {
    nextTick(() => {
        if (scrollbarRef.value) {
            scrollbarRef.value.setScrollTop(999999);
        }
    });
};
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['character-item']} */ ;
/** @type {__VLS_StyleScopedClasses['character-item']} */ ;
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
/** @ts-ignore @type {typeof __VLS_components.elAside | typeof __VLS_components.ElAside | typeof __VLS_components.elAside | typeof __VLS_components.ElAside} */
elAside;
// @ts-ignore
const __VLS_7 = __VLS_asFunctionalComponent1(__VLS_6, new __VLS_6({
    width: "280px",
    ...{ class: "sidebar" },
}));
const __VLS_8 = __VLS_7({
    width: "280px",
    ...{ class: "sidebar" },
}, ...__VLS_functionalComponentArgsRest(__VLS_7));
/** @type {__VLS_StyleScopedClasses['sidebar']} */ ;
const { default: __VLS_11 } = __VLS_9.slots;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "aside-header" },
});
/** @type {__VLS_StyleScopedClasses['aside-header']} */ ;
let __VLS_12;
/** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
elButton;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent1(__VLS_12, new __VLS_12({
    ...{ 'onClick': {} },
    type: "primary",
    size: "large",
    ...{ class: "create-btn" },
}));
const __VLS_14 = __VLS_13({
    ...{ 'onClick': {} },
    type: "primary",
    size: "large",
    ...{ class: "create-btn" },
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
let __VLS_17;
const __VLS_18 = ({ click: {} },
    { onClick: (...[$event]) => {
            __VLS_ctx.showCreateDialog = true;
            // @ts-ignore
            [showCreateDialog,];
        } });
/** @type {__VLS_StyleScopedClasses['create-btn']} */ ;
const { default: __VLS_19 } = __VLS_15.slots;
let __VLS_20;
/** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
elIcon;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent1(__VLS_20, new __VLS_20({
    ...{ style: {} },
}));
const __VLS_22 = __VLS_21({
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
const { default: __VLS_25 } = __VLS_23.slots;
let __VLS_26;
/** @ts-ignore @type {typeof __VLS_components.Plus} */
Plus;
// @ts-ignore
const __VLS_27 = __VLS_asFunctionalComponent1(__VLS_26, new __VLS_26({}));
const __VLS_28 = __VLS_27({}, ...__VLS_functionalComponentArgsRest(__VLS_27));
// @ts-ignore
[];
var __VLS_23;
// @ts-ignore
[];
var __VLS_15;
var __VLS_16;
let __VLS_31;
/** @ts-ignore @type {typeof __VLS_components.elScrollbar | typeof __VLS_components.ElScrollbar | typeof __VLS_components.elScrollbar | typeof __VLS_components.ElScrollbar} */
elScrollbar;
// @ts-ignore
const __VLS_32 = __VLS_asFunctionalComponent1(__VLS_31, new __VLS_31({
    height: "calc(100% - 90px)",
}));
const __VLS_33 = __VLS_32({
    height: "calc(100% - 90px)",
}, ...__VLS_functionalComponentArgsRest(__VLS_32));
const { default: __VLS_36 } = __VLS_34.slots;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "character-list" },
});
/** @type {__VLS_StyleScopedClasses['character-list']} */ ;
for (const [char] of __VLS_vFor((__VLS_ctx.characterStore.characters))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.selectCharacter(char.id);
                // @ts-ignore
                [characterStore, selectCharacter,];
            } },
        key: (char.id),
        ...{ class: "character-item" },
        ...{ class: ({ active: __VLS_ctx.currentCharacterId === char.id }) },
    });
    /** @type {__VLS_StyleScopedClasses['character-item']} */ ;
    /** @type {__VLS_StyleScopedClasses['active']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "character-info" },
    });
    /** @type {__VLS_StyleScopedClasses['character-info']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "character-name" },
    });
    /** @type {__VLS_StyleScopedClasses['character-name']} */ ;
    (char.name);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "character-desc" },
    });
    /** @type {__VLS_StyleScopedClasses['character-desc']} */ ;
    (char.description);
    if (!char.metadata?.isPreset) {
        let __VLS_37;
        /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
        elButton;
        // @ts-ignore
        const __VLS_38 = __VLS_asFunctionalComponent1(__VLS_37, new __VLS_37({
            ...{ 'onClick': {} },
            type: "danger",
            size: "small",
            text: true,
            circle: true,
        }));
        const __VLS_39 = __VLS_38({
            ...{ 'onClick': {} },
            type: "danger",
            size: "small",
            text: true,
            circle: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_38));
        let __VLS_42;
        const __VLS_43 = ({ click: {} },
            { onClick: (...[$event]) => {
                    if (!(!char.metadata?.isPreset))
                        return;
                    __VLS_ctx.deleteCharacter(char.id);
                    // @ts-ignore
                    [currentCharacterId, deleteCharacter,];
                } });
        const { default: __VLS_44 } = __VLS_40.slots;
        let __VLS_45;
        /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
        elIcon;
        // @ts-ignore
        const __VLS_46 = __VLS_asFunctionalComponent1(__VLS_45, new __VLS_45({}));
        const __VLS_47 = __VLS_46({}, ...__VLS_functionalComponentArgsRest(__VLS_46));
        const { default: __VLS_50 } = __VLS_48.slots;
        let __VLS_51;
        /** @ts-ignore @type {typeof __VLS_components.Delete} */
        Delete;
        // @ts-ignore
        const __VLS_52 = __VLS_asFunctionalComponent1(__VLS_51, new __VLS_51({}));
        const __VLS_53 = __VLS_52({}, ...__VLS_functionalComponentArgsRest(__VLS_52));
        // @ts-ignore
        [];
        var __VLS_48;
        // @ts-ignore
        [];
        var __VLS_40;
        var __VLS_41;
    }
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_34;
// @ts-ignore
[];
var __VLS_9;
let __VLS_56;
/** @ts-ignore @type {typeof __VLS_components.elContainer | typeof __VLS_components.ElContainer | typeof __VLS_components.elContainer | typeof __VLS_components.ElContainer} */
elContainer;
// @ts-ignore
const __VLS_57 = __VLS_asFunctionalComponent1(__VLS_56, new __VLS_56({
    ...{ class: "chat-container" },
}));
const __VLS_58 = __VLS_57({
    ...{ class: "chat-container" },
}, ...__VLS_functionalComponentArgsRest(__VLS_57));
/** @type {__VLS_StyleScopedClasses['chat-container']} */ ;
const { default: __VLS_61 } = __VLS_59.slots;
if (!__VLS_ctx.currentCharacterId) {
    let __VLS_62;
    /** @ts-ignore @type {typeof __VLS_components.elMain | typeof __VLS_components.ElMain | typeof __VLS_components.elMain | typeof __VLS_components.ElMain} */
    elMain;
    // @ts-ignore
    const __VLS_63 = __VLS_asFunctionalComponent1(__VLS_62, new __VLS_62({
        ...{ class: "empty-state" },
    }));
    const __VLS_64 = __VLS_63({
        ...{ class: "empty-state" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_63));
    /** @type {__VLS_StyleScopedClasses['empty-state']} */ ;
    const { default: __VLS_67 } = __VLS_65.slots;
    let __VLS_68;
    /** @ts-ignore @type {typeof __VLS_components.elEmpty | typeof __VLS_components.ElEmpty} */
    elEmpty;
    // @ts-ignore
    const __VLS_69 = __VLS_asFunctionalComponent1(__VLS_68, new __VLS_68({
        description: "请选择一个角色开始对话",
    }));
    const __VLS_70 = __VLS_69({
        description: "请选择一个角色开始对话",
    }, ...__VLS_functionalComponentArgsRest(__VLS_69));
    // @ts-ignore
    [currentCharacterId,];
    var __VLS_65;
}
else {
    let __VLS_73;
    /** @ts-ignore @type {typeof __VLS_components.elHeader | typeof __VLS_components.ElHeader | typeof __VLS_components.elHeader | typeof __VLS_components.ElHeader} */
    elHeader;
    // @ts-ignore
    const __VLS_74 = __VLS_asFunctionalComponent1(__VLS_73, new __VLS_73({
        height: "70px",
        ...{ class: "chat-header-container" },
    }));
    const __VLS_75 = __VLS_74({
        height: "70px",
        ...{ class: "chat-header-container" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_74));
    /** @type {__VLS_StyleScopedClasses['chat-header-container']} */ ;
    const { default: __VLS_78 } = __VLS_76.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "chat-header" },
    });
    /** @type {__VLS_StyleScopedClasses['chat-header']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "header-left" },
    });
    /** @type {__VLS_StyleScopedClasses['header-left']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
    (__VLS_ctx.characterStore.currentCharacter?.name);
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "header-hint" },
    });
    /** @type {__VLS_StyleScopedClasses['header-hint']} */ ;
    let __VLS_79;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_80 = __VLS_asFunctionalComponent1(__VLS_79, new __VLS_79({
        ...{ 'onClick': {} },
        text: true,
    }));
    const __VLS_81 = __VLS_80({
        ...{ 'onClick': {} },
        text: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_80));
    let __VLS_84;
    const __VLS_85 = ({ click: {} },
        { onClick: (__VLS_ctx.clearChat) });
    const { default: __VLS_86 } = __VLS_82.slots;
    let __VLS_87;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_88 = __VLS_asFunctionalComponent1(__VLS_87, new __VLS_87({
        ...{ style: {} },
    }));
    const __VLS_89 = __VLS_88({
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_88));
    const { default: __VLS_92 } = __VLS_90.slots;
    let __VLS_93;
    /** @ts-ignore @type {typeof __VLS_components.Delete} */
    Delete;
    // @ts-ignore
    const __VLS_94 = __VLS_asFunctionalComponent1(__VLS_93, new __VLS_93({}));
    const __VLS_95 = __VLS_94({}, ...__VLS_functionalComponentArgsRest(__VLS_94));
    // @ts-ignore
    [characterStore, clearChat,];
    var __VLS_90;
    // @ts-ignore
    [];
    var __VLS_82;
    var __VLS_83;
    // @ts-ignore
    [];
    var __VLS_76;
    let __VLS_98;
    /** @ts-ignore @type {typeof __VLS_components.elMain | typeof __VLS_components.ElMain | typeof __VLS_components.elMain | typeof __VLS_components.ElMain} */
    elMain;
    // @ts-ignore
    const __VLS_99 = __VLS_asFunctionalComponent1(__VLS_98, new __VLS_98({
        ...{ class: "chat-main" },
    }));
    const __VLS_100 = __VLS_99({
        ...{ class: "chat-main" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_99));
    /** @type {__VLS_StyleScopedClasses['chat-main']} */ ;
    const { default: __VLS_103 } = __VLS_101.slots;
    let __VLS_104;
    /** @ts-ignore @type {typeof __VLS_components.elScrollbar | typeof __VLS_components.ElScrollbar | typeof __VLS_components.elScrollbar | typeof __VLS_components.ElScrollbar} */
    elScrollbar;
    // @ts-ignore
    const __VLS_105 = __VLS_asFunctionalComponent1(__VLS_104, new __VLS_104({
        ref: "scrollbarRef",
        height: "100%",
    }));
    const __VLS_106 = __VLS_105({
        ref: "scrollbarRef",
        height: "100%",
    }, ...__VLS_functionalComponentArgsRest(__VLS_105));
    var __VLS_109 = {};
    const { default: __VLS_111 } = __VLS_107.slots;
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
            let __VLS_112;
            /** @ts-ignore @type {typeof __VLS_components.elAvatar | typeof __VLS_components.ElAvatar | typeof __VLS_components.elAvatar | typeof __VLS_components.ElAvatar} */
            elAvatar;
            // @ts-ignore
            const __VLS_113 = __VLS_asFunctionalComponent1(__VLS_112, new __VLS_112({
                size: (36),
            }));
            const __VLS_114 = __VLS_113({
                size: (36),
            }, ...__VLS_functionalComponentArgsRest(__VLS_113));
            const { default: __VLS_117 } = __VLS_115.slots;
            let __VLS_118;
            /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
            elIcon;
            // @ts-ignore
            const __VLS_119 = __VLS_asFunctionalComponent1(__VLS_118, new __VLS_118({}));
            const __VLS_120 = __VLS_119({}, ...__VLS_functionalComponentArgsRest(__VLS_119));
            const { default: __VLS_123 } = __VLS_121.slots;
            let __VLS_124;
            /** @ts-ignore @type {typeof __VLS_components.User} */
            User;
            // @ts-ignore
            const __VLS_125 = __VLS_asFunctionalComponent1(__VLS_124, new __VLS_124({}));
            const __VLS_126 = __VLS_125({}, ...__VLS_functionalComponentArgsRest(__VLS_125));
            // @ts-ignore
            [chatStore,];
            var __VLS_121;
            // @ts-ignore
            [];
            var __VLS_115;
        }
        else {
            let __VLS_129;
            /** @ts-ignore @type {typeof __VLS_components.elAvatar | typeof __VLS_components.ElAvatar | typeof __VLS_components.elAvatar | typeof __VLS_components.ElAvatar} */
            elAvatar;
            // @ts-ignore
            const __VLS_130 = __VLS_asFunctionalComponent1(__VLS_129, new __VLS_129({
                size: (36),
                ...{ style: {} },
            }));
            const __VLS_131 = __VLS_130({
                size: (36),
                ...{ style: {} },
            }, ...__VLS_functionalComponentArgsRest(__VLS_130));
            const { default: __VLS_134 } = __VLS_132.slots;
            let __VLS_135;
            /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
            elIcon;
            // @ts-ignore
            const __VLS_136 = __VLS_asFunctionalComponent1(__VLS_135, new __VLS_135({}));
            const __VLS_137 = __VLS_136({}, ...__VLS_functionalComponentArgsRest(__VLS_136));
            const { default: __VLS_140 } = __VLS_138.slots;
            let __VLS_141;
            /** @ts-ignore @type {typeof __VLS_components.ChatDotRound} */
            ChatDotRound;
            // @ts-ignore
            const __VLS_142 = __VLS_asFunctionalComponent1(__VLS_141, new __VLS_141({}));
            const __VLS_143 = __VLS_142({}, ...__VLS_functionalComponentArgsRest(__VLS_142));
            // @ts-ignore
            [];
            var __VLS_138;
            // @ts-ignore
            [];
            var __VLS_132;
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "message-content" },
        });
        /** @type {__VLS_StyleScopedClasses['message-content']} */ ;
        const __VLS_146 = MessageCard;
        // @ts-ignore
        const __VLS_147 = __VLS_asFunctionalComponent1(__VLS_146, new __VLS_146({
            content: (msg.content),
            metadata: (msg.metadata),
        }));
        const __VLS_148 = __VLS_147({
            content: (msg.content),
            metadata: (msg.metadata),
        }, ...__VLS_functionalComponentArgsRest(__VLS_147));
        // @ts-ignore
        [];
    }
    // @ts-ignore
    [];
    var __VLS_107;
    // @ts-ignore
    [];
    var __VLS_101;
    let __VLS_151;
    /** @ts-ignore @type {typeof __VLS_components.elFooter | typeof __VLS_components.ElFooter | typeof __VLS_components.elFooter | typeof __VLS_components.ElFooter} */
    elFooter;
    // @ts-ignore
    const __VLS_152 = __VLS_asFunctionalComponent1(__VLS_151, new __VLS_151({
        height: "auto",
        ...{ class: "chat-footer" },
    }));
    const __VLS_153 = __VLS_152({
        height: "auto",
        ...{ class: "chat-footer" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_152));
    /** @type {__VLS_StyleScopedClasses['chat-footer']} */ ;
    const { default: __VLS_156 } = __VLS_154.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "model-selector" },
    });
    /** @type {__VLS_StyleScopedClasses['model-selector']} */ ;
    let __VLS_157;
    /** @ts-ignore @type {typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect} */
    elSelect;
    // @ts-ignore
    const __VLS_158 = __VLS_asFunctionalComponent1(__VLS_157, new __VLS_157({
        modelValue: (__VLS_ctx.chatStore.aiModel),
        size: "small",
        ...{ style: {} },
        placeholder: "选择模型",
    }));
    const __VLS_159 = __VLS_158({
        modelValue: (__VLS_ctx.chatStore.aiModel),
        size: "small",
        ...{ style: {} },
        placeholder: "选择模型",
    }, ...__VLS_functionalComponentArgsRest(__VLS_158));
    const { default: __VLS_162 } = __VLS_160.slots;
    for (const [model] of __VLS_vFor((__VLS_ctx.availableModels))) {
        let __VLS_163;
        /** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
        elOption;
        // @ts-ignore
        const __VLS_164 = __VLS_asFunctionalComponent1(__VLS_163, new __VLS_163({
            key: (model.value),
            value: (model.value),
            label: (model.label),
        }));
        const __VLS_165 = __VLS_164({
            key: (model.value),
            value: (model.value),
            label: (model.label),
        }, ...__VLS_functionalComponentArgsRest(__VLS_164));
        const { default: __VLS_168 } = __VLS_166.slots;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ style: {} },
        });
        let __VLS_169;
        /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
        elIcon;
        // @ts-ignore
        const __VLS_170 = __VLS_asFunctionalComponent1(__VLS_169, new __VLS_169({
            ...{ style: {} },
        }));
        const __VLS_171 = __VLS_170({
            ...{ style: {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_170));
        const { default: __VLS_174 } = __VLS_172.slots;
        if (model.icon === 'lightning') {
            let __VLS_175;
            /** @ts-ignore @type {typeof __VLS_components.Lightning} */
            Lightning;
            // @ts-ignore
            const __VLS_176 = __VLS_asFunctionalComponent1(__VLS_175, new __VLS_175({}));
            const __VLS_177 = __VLS_176({}, ...__VLS_functionalComponentArgsRest(__VLS_176));
        }
        else {
            let __VLS_180;
            /** @ts-ignore @type {typeof __VLS_components.MagicStick} */
            MagicStick;
            // @ts-ignore
            const __VLS_181 = __VLS_asFunctionalComponent1(__VLS_180, new __VLS_180({}));
            const __VLS_182 = __VLS_181({}, ...__VLS_functionalComponentArgsRest(__VLS_181));
        }
        // @ts-ignore
        [chatStore, availableModels,];
        var __VLS_172;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        (model.label);
        // @ts-ignore
        [];
        var __VLS_166;
        // @ts-ignore
        [];
    }
    // @ts-ignore
    [];
    var __VLS_160;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "input-area" },
    });
    /** @type {__VLS_StyleScopedClasses['input-area']} */ ;
    if (__VLS_ctx.selectedImage) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "image-preview" },
        });
        /** @type {__VLS_StyleScopedClasses['image-preview']} */ ;
        let __VLS_185;
        /** @ts-ignore @type {typeof __VLS_components.elImage | typeof __VLS_components.ElImage} */
        elImage;
        // @ts-ignore
        const __VLS_186 = __VLS_asFunctionalComponent1(__VLS_185, new __VLS_185({
            src: (__VLS_ctx.selectedImage.preview),
            fit: "cover",
            ...{ class: "preview-image" },
        }));
        const __VLS_187 = __VLS_186({
            src: (__VLS_ctx.selectedImage.preview),
            fit: "cover",
            ...{ class: "preview-image" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_186));
        /** @type {__VLS_StyleScopedClasses['preview-image']} */ ;
        let __VLS_190;
        /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
        elButton;
        // @ts-ignore
        const __VLS_191 = __VLS_asFunctionalComponent1(__VLS_190, new __VLS_190({
            ...{ 'onClick': {} },
            type: "danger",
            size: "small",
            circle: true,
            ...{ class: "remove-image-btn" },
        }));
        const __VLS_192 = __VLS_191({
            ...{ 'onClick': {} },
            type: "danger",
            size: "small",
            circle: true,
            ...{ class: "remove-image-btn" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_191));
        let __VLS_195;
        const __VLS_196 = ({ click: {} },
            { onClick: (__VLS_ctx.removeImage) });
        /** @type {__VLS_StyleScopedClasses['remove-image-btn']} */ ;
        const { default: __VLS_197 } = __VLS_193.slots;
        let __VLS_198;
        /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
        elIcon;
        // @ts-ignore
        const __VLS_199 = __VLS_asFunctionalComponent1(__VLS_198, new __VLS_198({}));
        const __VLS_200 = __VLS_199({}, ...__VLS_functionalComponentArgsRest(__VLS_199));
        const { default: __VLS_203 } = __VLS_201.slots;
        let __VLS_204;
        /** @ts-ignore @type {typeof __VLS_components.Close} */
        Close;
        // @ts-ignore
        const __VLS_205 = __VLS_asFunctionalComponent1(__VLS_204, new __VLS_204({}));
        const __VLS_206 = __VLS_205({}, ...__VLS_functionalComponentArgsRest(__VLS_205));
        // @ts-ignore
        [selectedImage, selectedImage, removeImage,];
        var __VLS_201;
        // @ts-ignore
        [];
        var __VLS_193;
        var __VLS_194;
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "input-row" },
    });
    /** @type {__VLS_StyleScopedClasses['input-row']} */ ;
    let __VLS_209;
    /** @ts-ignore @type {typeof __VLS_components.elUpload | typeof __VLS_components.ElUpload | typeof __VLS_components.elUpload | typeof __VLS_components.ElUpload} */
    elUpload;
    // @ts-ignore
    const __VLS_210 = __VLS_asFunctionalComponent1(__VLS_209, new __VLS_209({
        ref: "uploadRef",
        autoUpload: (false),
        showFileList: (false),
        accept: "image/*",
        onChange: (__VLS_ctx.handleImageSelect),
    }));
    const __VLS_211 = __VLS_210({
        ref: "uploadRef",
        autoUpload: (false),
        showFileList: (false),
        accept: "image/*",
        onChange: (__VLS_ctx.handleImageSelect),
    }, ...__VLS_functionalComponentArgsRest(__VLS_210));
    var __VLS_214 = {};
    const { default: __VLS_216 } = __VLS_212.slots;
    let __VLS_217;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_218 = __VLS_asFunctionalComponent1(__VLS_217, new __VLS_217({
        circle: true,
        size: "large",
        ...{ class: "image-btn" },
    }));
    const __VLS_219 = __VLS_218({
        circle: true,
        size: "large",
        ...{ class: "image-btn" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_218));
    /** @type {__VLS_StyleScopedClasses['image-btn']} */ ;
    const { default: __VLS_222 } = __VLS_220.slots;
    let __VLS_223;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_224 = __VLS_asFunctionalComponent1(__VLS_223, new __VLS_223({}));
    const __VLS_225 = __VLS_224({}, ...__VLS_functionalComponentArgsRest(__VLS_224));
    const { default: __VLS_228 } = __VLS_226.slots;
    let __VLS_229;
    /** @ts-ignore @type {typeof __VLS_components.Picture} */
    Picture;
    // @ts-ignore
    const __VLS_230 = __VLS_asFunctionalComponent1(__VLS_229, new __VLS_229({}));
    const __VLS_231 = __VLS_230({}, ...__VLS_functionalComponentArgsRest(__VLS_230));
    // @ts-ignore
    [handleImageSelect,];
    var __VLS_226;
    // @ts-ignore
    [];
    var __VLS_220;
    // @ts-ignore
    [];
    var __VLS_212;
    let __VLS_234;
    /** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
    elInput;
    // @ts-ignore
    const __VLS_235 = __VLS_asFunctionalComponent1(__VLS_234, new __VLS_234({
        ...{ 'onKeydown': {} },
        modelValue: (__VLS_ctx.inputMessage),
        type: "textarea",
        rows: (4),
        placeholder: "输入消息... (Ctrl+Enter 发送)",
        ...{ class: "input-box" },
    }));
    const __VLS_236 = __VLS_235({
        ...{ 'onKeydown': {} },
        modelValue: (__VLS_ctx.inputMessage),
        type: "textarea",
        rows: (4),
        placeholder: "输入消息... (Ctrl+Enter 发送)",
        ...{ class: "input-box" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_235));
    let __VLS_239;
    const __VLS_240 = ({ keydown: {} },
        { onKeydown: (__VLS_ctx.sendMessage) });
    /** @type {__VLS_StyleScopedClasses['input-box']} */ ;
    var __VLS_237;
    var __VLS_238;
    let __VLS_241;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_242 = __VLS_asFunctionalComponent1(__VLS_241, new __VLS_241({
        ...{ 'onClick': {} },
        type: "primary",
        circle: true,
        size: "large",
        ...{ class: "send-btn" },
        loading: (__VLS_ctx.chatStore.streaming),
        disabled: (!__VLS_ctx.inputMessage.trim() && !__VLS_ctx.selectedImage),
    }));
    const __VLS_243 = __VLS_242({
        ...{ 'onClick': {} },
        type: "primary",
        circle: true,
        size: "large",
        ...{ class: "send-btn" },
        loading: (__VLS_ctx.chatStore.streaming),
        disabled: (!__VLS_ctx.inputMessage.trim() && !__VLS_ctx.selectedImage),
    }, ...__VLS_functionalComponentArgsRest(__VLS_242));
    let __VLS_246;
    const __VLS_247 = ({ click: {} },
        { onClick: (__VLS_ctx.sendMessage) });
    /** @type {__VLS_StyleScopedClasses['send-btn']} */ ;
    const { default: __VLS_248 } = __VLS_244.slots;
    if (!__VLS_ctx.chatStore.streaming) {
        let __VLS_249;
        /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
        elIcon;
        // @ts-ignore
        const __VLS_250 = __VLS_asFunctionalComponent1(__VLS_249, new __VLS_249({}));
        const __VLS_251 = __VLS_250({}, ...__VLS_functionalComponentArgsRest(__VLS_250));
        const { default: __VLS_254 } = __VLS_252.slots;
        let __VLS_255;
        /** @ts-ignore @type {typeof __VLS_components.Promotion} */
        Promotion;
        // @ts-ignore
        const __VLS_256 = __VLS_asFunctionalComponent1(__VLS_255, new __VLS_255({}));
        const __VLS_257 = __VLS_256({}, ...__VLS_functionalComponentArgsRest(__VLS_256));
        // @ts-ignore
        [chatStore, chatStore, selectedImage, inputMessage, inputMessage, sendMessage, sendMessage,];
        var __VLS_252;
    }
    // @ts-ignore
    [];
    var __VLS_244;
    var __VLS_245;
    // @ts-ignore
    [];
    var __VLS_154;
}
// @ts-ignore
[];
var __VLS_59;
// @ts-ignore
[];
var __VLS_3;
let __VLS_260;
/** @ts-ignore @type {typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog | typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog} */
elDialog;
// @ts-ignore
const __VLS_261 = __VLS_asFunctionalComponent1(__VLS_260, new __VLS_260({
    modelValue: (__VLS_ctx.showCreateDialog),
    title: "创建角色",
    width: "500px",
}));
const __VLS_262 = __VLS_261({
    modelValue: (__VLS_ctx.showCreateDialog),
    title: "创建角色",
    width: "500px",
}, ...__VLS_functionalComponentArgsRest(__VLS_261));
const { default: __VLS_265 } = __VLS_263.slots;
let __VLS_266;
/** @ts-ignore @type {typeof __VLS_components.elForm | typeof __VLS_components.ElForm | typeof __VLS_components.elForm | typeof __VLS_components.ElForm} */
elForm;
// @ts-ignore
const __VLS_267 = __VLS_asFunctionalComponent1(__VLS_266, new __VLS_266({
    model: (__VLS_ctx.createForm),
    labelWidth: "80px",
}));
const __VLS_268 = __VLS_267({
    model: (__VLS_ctx.createForm),
    labelWidth: "80px",
}, ...__VLS_functionalComponentArgsRest(__VLS_267));
const { default: __VLS_271 } = __VLS_269.slots;
let __VLS_272;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_273 = __VLS_asFunctionalComponent1(__VLS_272, new __VLS_272({
    label: "角色名称",
}));
const __VLS_274 = __VLS_273({
    label: "角色名称",
}, ...__VLS_functionalComponentArgsRest(__VLS_273));
const { default: __VLS_277 } = __VLS_275.slots;
let __VLS_278;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_279 = __VLS_asFunctionalComponent1(__VLS_278, new __VLS_278({
    modelValue: (__VLS_ctx.createForm.name),
    maxlength: "100",
    showWordLimit: true,
}));
const __VLS_280 = __VLS_279({
    modelValue: (__VLS_ctx.createForm.name),
    maxlength: "100",
    showWordLimit: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_279));
// @ts-ignore
[showCreateDialog, createForm, createForm,];
var __VLS_275;
let __VLS_283;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_284 = __VLS_asFunctionalComponent1(__VLS_283, new __VLS_283({
    label: "简介",
}));
const __VLS_285 = __VLS_284({
    label: "简介",
}, ...__VLS_functionalComponentArgsRest(__VLS_284));
const { default: __VLS_288 } = __VLS_286.slots;
let __VLS_289;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_290 = __VLS_asFunctionalComponent1(__VLS_289, new __VLS_289({
    modelValue: (__VLS_ctx.createForm.description),
    maxlength: "500",
    showWordLimit: true,
}));
const __VLS_291 = __VLS_290({
    modelValue: (__VLS_ctx.createForm.description),
    maxlength: "500",
    showWordLimit: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_290));
// @ts-ignore
[createForm,];
var __VLS_286;
let __VLS_294;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_295 = __VLS_asFunctionalComponent1(__VLS_294, new __VLS_294({
    label: "背景故事",
}));
const __VLS_296 = __VLS_295({
    label: "背景故事",
}, ...__VLS_functionalComponentArgsRest(__VLS_295));
const { default: __VLS_299 } = __VLS_297.slots;
let __VLS_300;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_301 = __VLS_asFunctionalComponent1(__VLS_300, new __VLS_300({
    modelValue: (__VLS_ctx.createForm.backgroundStory),
    type: "textarea",
    rows: (4),
    maxlength: "2000",
    showWordLimit: true,
}));
const __VLS_302 = __VLS_301({
    modelValue: (__VLS_ctx.createForm.backgroundStory),
    type: "textarea",
    rows: (4),
    maxlength: "2000",
    showWordLimit: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_301));
// @ts-ignore
[createForm,];
var __VLS_297;
// @ts-ignore
[];
var __VLS_269;
{
    const { footer: __VLS_305 } = __VLS_263.slots;
    let __VLS_306;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_307 = __VLS_asFunctionalComponent1(__VLS_306, new __VLS_306({
        ...{ 'onClick': {} },
    }));
    const __VLS_308 = __VLS_307({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_307));
    let __VLS_311;
    const __VLS_312 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.showCreateDialog = false;
                // @ts-ignore
                [showCreateDialog,];
            } });
    const { default: __VLS_313 } = __VLS_309.slots;
    // @ts-ignore
    [];
    var __VLS_309;
    var __VLS_310;
    let __VLS_314;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_315 = __VLS_asFunctionalComponent1(__VLS_314, new __VLS_314({
        ...{ 'onClick': {} },
        type: "primary",
        loading: (__VLS_ctx.characterStore.loading),
    }));
    const __VLS_316 = __VLS_315({
        ...{ 'onClick': {} },
        type: "primary",
        loading: (__VLS_ctx.characterStore.loading),
    }, ...__VLS_functionalComponentArgsRest(__VLS_315));
    let __VLS_319;
    const __VLS_320 = ({ click: {} },
        { onClick: (__VLS_ctx.createCharacter) });
    const { default: __VLS_321 } = __VLS_317.slots;
    // @ts-ignore
    [characterStore, createCharacter,];
    var __VLS_317;
    var __VLS_318;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_263;
// @ts-ignore
var __VLS_110 = __VLS_109, __VLS_215 = __VLS_214;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
