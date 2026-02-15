/// <reference types="../../node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useConversationStore } from '@/stores/conversation';
import { useCharacterStore } from '@/stores/character';
import { useUserProfileStore } from '@/stores/userProfile';
import { Search, Setting, Plus, Operation } from '@element-plus/icons-vue';
import ConversationList from './ConversationList.vue';
import SettingsDialog from './SettingsDialog.vue';
const router = useRouter();
const conversationStore = useConversationStore();
const characterStore = useCharacterStore();
const userProfileStore = useUserProfileStore();
const searchKeyword = ref('');
const showSettings = ref(false);
const batchMode = ref(false);
const selectedIds = ref([]);
const selectAll = ref(false);
const creating = ref(false);
const defaultModeId = computed(() => userProfileStore.profile?.defaultModeId);
const filteredConversations = computed(() => {
    if (!searchKeyword.value)
        return conversationStore.conversations;
    return conversationStore.conversations.filter((conv) => conv.title.toLowerCase().includes(searchKeyword.value.toLowerCase()));
});
onMounted(async () => {
    await Promise.all([
        conversationStore.fetchConversations(),
        characterStore.fetchCharacters(),
        userProfileStore.fetchProfile(),
    ]);
});
const selectConversation = async (id) => {
    if (batchMode.value)
        return;
    await conversationStore.selectConversation(id);
};
const deleteConversation = async (id) => {
    try {
        await ElMessageBox.confirm('确认删除此对话？', '提示', {
            confirmButtonText: '确认',
            cancelButtonText: '取消',
            type: 'warning',
        });
        await conversationStore.deleteConversation(id);
        ElMessage.success('删除成功');
    }
    catch {
        // 用户取消
    }
};
const handleQuickCreate = async () => {
    // 防止重复点击
    if (creating.value)
        return;
    creating.value = true;
    try {
        // 1. 获取默认角色ID
        let characterId = defaultModeId.value;
        // 2. 如果没有设置，使用第一个预设角色
        if (!characterId) {
            const presetCharacters = characterStore.characters.filter((char) => char.metadata?.isPreset === true);
            if (presetCharacters.length > 0) {
                characterId = presetCharacters[0].id;
            }
            else {
                // 异常情况：没有预设角色
                ElMessage.warning('请先在设置中选择默认回复风格');
                showSettings.value = true;
                return;
            }
        }
        // 3. 验证角色是否存在（防止角色被删除）
        const character = characterStore.characters.find(c => c.id === characterId);
        if (!character) {
            // 回退到第一个预设角色
            const presetCharacters = characterStore.characters.filter((char) => char.metadata?.isPreset === true);
            characterId = presetCharacters[0]?.id;
            if (!characterId) {
                ElMessage.warning('请先在设置中选择默认回复风格');
                showSettings.value = true;
                return;
            }
        }
        // 4. 清空当前会话，进入新建模式
        conversationStore.clearCurrentConversation();
        ElMessage.success('已进入新对话模式');
    }
    catch (error) {
        console.error('进入新对话模式失败:', error);
        ElMessage.error('进入新对话模式失败');
    }
    finally {
        creating.value = false;
    }
};
const enterBatchMode = () => {
    batchMode.value = true;
    selectedIds.value = [];
    selectAll.value = false;
};
const exitBatchMode = () => {
    batchMode.value = false;
    selectedIds.value = [];
    selectAll.value = false;
};
const toggleSelect = (id) => {
    const index = selectedIds.value.indexOf(id);
    if (index > -1) {
        selectedIds.value.splice(index, 1);
    }
    else {
        selectedIds.value.push(id);
    }
    selectAll.value = selectedIds.value.length === filteredConversations.value.length;
};
const handleSelectAll = (checked) => {
    if (checked) {
        selectedIds.value = filteredConversations.value.map((conv) => conv.id);
    }
    else {
        selectedIds.value = [];
    }
};
const batchDelete = async () => {
    try {
        await ElMessageBox.confirm(`确认删除选中的 ${selectedIds.value.length} 个对话？`, '提示', {
            confirmButtonText: '确认',
            cancelButtonText: '取消',
            type: 'warning',
        });
        await Promise.all(selectedIds.value.map((id) => conversationStore.deleteConversation(id)));
        ElMessage.success('批量删除成功');
        exitBatchMode();
    }
    catch {
        // 用户取消
    }
};
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "sidebar" },
});
/** @type {__VLS_StyleScopedClasses['sidebar']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "sidebar-content" },
});
/** @type {__VLS_StyleScopedClasses['sidebar-content']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "aside-header" },
});
/** @type {__VLS_StyleScopedClasses['aside-header']} */ ;
let __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
elButton;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    ...{ 'onClick': {} },
    type: "primary",
    ...{ style: {} },
}));
const __VLS_2 = __VLS_1({
    ...{ 'onClick': {} },
    type: "primary",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_5;
const __VLS_6 = ({ click: {} },
    { onClick: (__VLS_ctx.handleQuickCreate) });
const { default: __VLS_7 } = __VLS_3.slots;
let __VLS_8;
/** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
elIcon;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent1(__VLS_8, new __VLS_8({}));
const __VLS_10 = __VLS_9({}, ...__VLS_functionalComponentArgsRest(__VLS_9));
const { default: __VLS_13 } = __VLS_11.slots;
let __VLS_14;
/** @ts-ignore @type {typeof __VLS_components.Plus} */
Plus;
// @ts-ignore
const __VLS_15 = __VLS_asFunctionalComponent1(__VLS_14, new __VLS_14({}));
const __VLS_16 = __VLS_15({}, ...__VLS_functionalComponentArgsRest(__VLS_15));
// @ts-ignore
[handleQuickCreate,];
var __VLS_11;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
// @ts-ignore
[];
var __VLS_3;
var __VLS_4;
let __VLS_19;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_20 = __VLS_asFunctionalComponent1(__VLS_19, new __VLS_19({
    modelValue: (__VLS_ctx.searchKeyword),
    placeholder: "搜索对话...",
    size: "small",
    clearable: true,
}));
const __VLS_21 = __VLS_20({
    modelValue: (__VLS_ctx.searchKeyword),
    placeholder: "搜索对话...",
    size: "small",
    clearable: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_20));
const { default: __VLS_24 } = __VLS_22.slots;
{
    const { prefix: __VLS_25 } = __VLS_22.slots;
    let __VLS_26;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_27 = __VLS_asFunctionalComponent1(__VLS_26, new __VLS_26({}));
    const __VLS_28 = __VLS_27({}, ...__VLS_functionalComponentArgsRest(__VLS_27));
    const { default: __VLS_31 } = __VLS_29.slots;
    let __VLS_32;
    /** @ts-ignore @type {typeof __VLS_components.Search} */
    Search;
    // @ts-ignore
    const __VLS_33 = __VLS_asFunctionalComponent1(__VLS_32, new __VLS_32({}));
    const __VLS_34 = __VLS_33({}, ...__VLS_functionalComponentArgsRest(__VLS_33));
    // @ts-ignore
    [searchKeyword,];
    var __VLS_29;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_22;
if (!__VLS_ctx.batchMode) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "toolbar" },
    });
    /** @type {__VLS_StyleScopedClasses['toolbar']} */ ;
    let __VLS_37;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_38 = __VLS_asFunctionalComponent1(__VLS_37, new __VLS_37({
        ...{ 'onClick': {} },
        text: true,
        size: "small",
    }));
    const __VLS_39 = __VLS_38({
        ...{ 'onClick': {} },
        text: true,
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_38));
    let __VLS_42;
    const __VLS_43 = ({ click: {} },
        { onClick: (__VLS_ctx.enterBatchMode) });
    const { default: __VLS_44 } = __VLS_40.slots;
    let __VLS_45;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_46 = __VLS_asFunctionalComponent1(__VLS_45, new __VLS_45({}));
    const __VLS_47 = __VLS_46({}, ...__VLS_functionalComponentArgsRest(__VLS_46));
    const { default: __VLS_50 } = __VLS_48.slots;
    let __VLS_51;
    /** @ts-ignore @type {typeof __VLS_components.Operation} */
    Operation;
    // @ts-ignore
    const __VLS_52 = __VLS_asFunctionalComponent1(__VLS_51, new __VLS_51({}));
    const __VLS_53 = __VLS_52({}, ...__VLS_functionalComponentArgsRest(__VLS_52));
    // @ts-ignore
    [batchMode, enterBatchMode,];
    var __VLS_48;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    // @ts-ignore
    [];
    var __VLS_40;
    var __VLS_41;
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "batch-toolbar" },
    });
    /** @type {__VLS_StyleScopedClasses['batch-toolbar']} */ ;
    let __VLS_56;
    /** @ts-ignore @type {typeof __VLS_components.elCheckbox | typeof __VLS_components.ElCheckbox | typeof __VLS_components.elCheckbox | typeof __VLS_components.ElCheckbox} */
    elCheckbox;
    // @ts-ignore
    const __VLS_57 = __VLS_asFunctionalComponent1(__VLS_56, new __VLS_56({
        ...{ 'onChange': {} },
        modelValue: (__VLS_ctx.selectAll),
    }));
    const __VLS_58 = __VLS_57({
        ...{ 'onChange': {} },
        modelValue: (__VLS_ctx.selectAll),
    }, ...__VLS_functionalComponentArgsRest(__VLS_57));
    let __VLS_61;
    const __VLS_62 = ({ change: {} },
        { onChange: (__VLS_ctx.handleSelectAll) });
    const { default: __VLS_63 } = __VLS_59.slots;
    // @ts-ignore
    [selectAll, handleSelectAll,];
    var __VLS_59;
    var __VLS_60;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "batch-actions" },
    });
    /** @type {__VLS_StyleScopedClasses['batch-actions']} */ ;
    let __VLS_64;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_65 = __VLS_asFunctionalComponent1(__VLS_64, new __VLS_64({
        ...{ 'onClick': {} },
        text: true,
        type: "danger",
        size: "small",
        disabled: (__VLS_ctx.selectedIds.length === 0),
    }));
    const __VLS_66 = __VLS_65({
        ...{ 'onClick': {} },
        text: true,
        type: "danger",
        size: "small",
        disabled: (__VLS_ctx.selectedIds.length === 0),
    }, ...__VLS_functionalComponentArgsRest(__VLS_65));
    let __VLS_69;
    const __VLS_70 = ({ click: {} },
        { onClick: (__VLS_ctx.batchDelete) });
    const { default: __VLS_71 } = __VLS_67.slots;
    (__VLS_ctx.selectedIds.length);
    // @ts-ignore
    [selectedIds, selectedIds, batchDelete,];
    var __VLS_67;
    var __VLS_68;
    let __VLS_72;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_73 = __VLS_asFunctionalComponent1(__VLS_72, new __VLS_72({
        ...{ 'onClick': {} },
        text: true,
        size: "small",
    }));
    const __VLS_74 = __VLS_73({
        ...{ 'onClick': {} },
        text: true,
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_73));
    let __VLS_77;
    const __VLS_78 = ({ click: {} },
        { onClick: (__VLS_ctx.exitBatchMode) });
    const { default: __VLS_79 } = __VLS_75.slots;
    // @ts-ignore
    [exitBatchMode,];
    var __VLS_75;
    var __VLS_76;
}
let __VLS_80;
/** @ts-ignore @type {typeof __VLS_components.elScrollbar | typeof __VLS_components.ElScrollbar | typeof __VLS_components.elScrollbar | typeof __VLS_components.ElScrollbar} */
elScrollbar;
// @ts-ignore
const __VLS_81 = __VLS_asFunctionalComponent1(__VLS_80, new __VLS_80({
    height: "calc(100vh - 220px)",
}));
const __VLS_82 = __VLS_81({
    height: "calc(100vh - 220px)",
}, ...__VLS_functionalComponentArgsRest(__VLS_81));
const { default: __VLS_85 } = __VLS_83.slots;
const __VLS_86 = ConversationList;
// @ts-ignore
const __VLS_87 = __VLS_asFunctionalComponent1(__VLS_86, new __VLS_86({
    ...{ 'onSelect': {} },
    ...{ 'onDelete': {} },
    ...{ 'onToggleSelect': {} },
    conversations: (__VLS_ctx.filteredConversations),
    currentConversationId: (__VLS_ctx.conversationStore.currentConversation?.id || ''),
    batchMode: (__VLS_ctx.batchMode),
    selectedIds: (__VLS_ctx.selectedIds),
}));
const __VLS_88 = __VLS_87({
    ...{ 'onSelect': {} },
    ...{ 'onDelete': {} },
    ...{ 'onToggleSelect': {} },
    conversations: (__VLS_ctx.filteredConversations),
    currentConversationId: (__VLS_ctx.conversationStore.currentConversation?.id || ''),
    batchMode: (__VLS_ctx.batchMode),
    selectedIds: (__VLS_ctx.selectedIds),
}, ...__VLS_functionalComponentArgsRest(__VLS_87));
let __VLS_91;
const __VLS_92 = ({ select: {} },
    { onSelect: (__VLS_ctx.selectConversation) });
const __VLS_93 = ({ delete: {} },
    { onDelete: (__VLS_ctx.deleteConversation) });
const __VLS_94 = ({ toggleSelect: {} },
    { onToggleSelect: (__VLS_ctx.toggleSelect) });
var __VLS_89;
var __VLS_90;
// @ts-ignore
[batchMode, selectedIds, filteredConversations, conversationStore, selectConversation, deleteConversation, toggleSelect,];
var __VLS_83;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "sidebar-footer" },
});
/** @type {__VLS_StyleScopedClasses['sidebar-footer']} */ ;
let __VLS_95;
/** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
elButton;
// @ts-ignore
const __VLS_96 = __VLS_asFunctionalComponent1(__VLS_95, new __VLS_95({
    ...{ 'onClick': {} },
    text: true,
    ...{ style: {} },
}));
const __VLS_97 = __VLS_96({
    ...{ 'onClick': {} },
    text: true,
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_96));
let __VLS_100;
const __VLS_101 = ({ click: {} },
    { onClick: (...[$event]) => {
            __VLS_ctx.showSettings = true;
            // @ts-ignore
            [showSettings,];
        } });
const { default: __VLS_102 } = __VLS_98.slots;
let __VLS_103;
/** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
elIcon;
// @ts-ignore
const __VLS_104 = __VLS_asFunctionalComponent1(__VLS_103, new __VLS_103({}));
const __VLS_105 = __VLS_104({}, ...__VLS_functionalComponentArgsRest(__VLS_104));
const { default: __VLS_108 } = __VLS_106.slots;
let __VLS_109;
/** @ts-ignore @type {typeof __VLS_components.Setting} */
Setting;
// @ts-ignore
const __VLS_110 = __VLS_asFunctionalComponent1(__VLS_109, new __VLS_109({}));
const __VLS_111 = __VLS_110({}, ...__VLS_functionalComponentArgsRest(__VLS_110));
// @ts-ignore
[];
var __VLS_106;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
// @ts-ignore
[];
var __VLS_98;
var __VLS_99;
const __VLS_114 = SettingsDialog;
// @ts-ignore
const __VLS_115 = __VLS_asFunctionalComponent1(__VLS_114, new __VLS_114({
    modelValue: (__VLS_ctx.showSettings),
}));
const __VLS_116 = __VLS_115({
    modelValue: (__VLS_ctx.showSettings),
}, ...__VLS_functionalComponentArgsRest(__VLS_115));
// @ts-ignore
[showSettings,];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
