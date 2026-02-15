/// <reference types="../../node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { computed } from 'vue';
import { MoreFilled } from '@element-plus/icons-vue';
import { useCharacterStore } from '@/stores/character';
const props = defineProps();
const emit = defineEmits();
const characterStore = useCharacterStore();
// 创建角色ID到名称的映射，提升性能
const characterNameMap = computed(() => {
    const map = new Map();
    characterStore.characters.forEach(char => {
        map.set(char.id, char.name);
    });
    return map;
});
// 获取角色名称，角色不存在时返回空字符串
const getCharacterName = (characterId) => {
    return characterNameMap.value.get(characterId) || '';
};
const handleClick = (id) => {
    if (props.batchMode) {
        // 批量模式下，点击切换选择状态
        emit('toggleSelect', id);
    }
    else {
        // 正常模式下，点击选择对话
        emit('select', id);
    }
};
const groupedConversations = computed(() => {
    const groups = {
        today: [],
        yesterday: [],
        earlier: [],
    };
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    props.conversations.forEach((conv) => {
        const date = new Date(conv.updatedAt);
        const convDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        if (convDate.getTime() === today.getTime()) {
            groups.today.push(conv);
        }
        else if (convDate.getTime() === yesterday.getTime()) {
            groups.yesterday.push(conv);
        }
        else {
            groups.earlier.push(conv);
        }
    });
    return groups;
});
const formatTime = (dateString) => {
    const date = new Date(dateString);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
};
const __VLS_ctx = {
    ...{},
    ...{},
    ...{},
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['conversation-item']} */ ;
/** @type {__VLS_StyleScopedClasses['conversation-item']} */ ;
/** @type {__VLS_StyleScopedClasses['more-icon']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "conversation-list" },
});
/** @type {__VLS_StyleScopedClasses['conversation-list']} */ ;
if (__VLS_ctx.groupedConversations.today.length > 0) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "group-title" },
    });
    /** @type {__VLS_StyleScopedClasses['group-title']} */ ;
    for (const [conv] of __VLS_vFor((__VLS_ctx.groupedConversations.today))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.groupedConversations.today.length > 0))
                        return;
                    __VLS_ctx.handleClick(conv.id);
                    // @ts-ignore
                    [groupedConversations, groupedConversations, handleClick,];
                } },
            key: (conv.id),
            ...{ class: "conversation-item" },
            ...{ class: ({ active: __VLS_ctx.currentConversationId === conv.id }) },
        });
        /** @type {__VLS_StyleScopedClasses['conversation-item']} */ ;
        /** @type {__VLS_StyleScopedClasses['active']} */ ;
        if (__VLS_ctx.batchMode) {
            let __VLS_0;
            /** @ts-ignore @type {typeof __VLS_components.elCheckbox | typeof __VLS_components.ElCheckbox} */
            elCheckbox;
            // @ts-ignore
            const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
                ...{ 'onClick': {} },
                ...{ 'onChange': {} },
                modelValue: (__VLS_ctx.selectedIds.includes(conv.id)),
                ...{ class: "conversation-checkbox" },
            }));
            const __VLS_2 = __VLS_1({
                ...{ 'onClick': {} },
                ...{ 'onChange': {} },
                modelValue: (__VLS_ctx.selectedIds.includes(conv.id)),
                ...{ class: "conversation-checkbox" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_1));
            let __VLS_5;
            const __VLS_6 = ({ click: {} },
                { onClick: () => { } });
            const __VLS_7 = ({ change: {} },
                { onChange: (...[$event]) => {
                        if (!(__VLS_ctx.groupedConversations.today.length > 0))
                            return;
                        if (!(__VLS_ctx.batchMode))
                            return;
                        __VLS_ctx.$emit('toggleSelect', conv.id);
                        // @ts-ignore
                        [currentConversationId, batchMode, selectedIds, $emit,];
                    } });
            /** @type {__VLS_StyleScopedClasses['conversation-checkbox']} */ ;
            var __VLS_3;
            var __VLS_4;
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "conversation-content" },
        });
        /** @type {__VLS_StyleScopedClasses['conversation-content']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "conversation-header" },
        });
        /** @type {__VLS_StyleScopedClasses['conversation-header']} */ ;
        if (__VLS_ctx.getCharacterName(conv.characterId)) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "character-name" },
            });
            /** @type {__VLS_StyleScopedClasses['character-name']} */ ;
            (__VLS_ctx.getCharacterName(conv.characterId));
        }
        if (!__VLS_ctx.batchMode) {
            let __VLS_8;
            /** @ts-ignore @type {typeof __VLS_components.elDropdown | typeof __VLS_components.ElDropdown | typeof __VLS_components.elDropdown | typeof __VLS_components.ElDropdown} */
            elDropdown;
            // @ts-ignore
            const __VLS_9 = __VLS_asFunctionalComponent1(__VLS_8, new __VLS_8({
                ...{ 'onClick': {} },
                trigger: "click",
            }));
            const __VLS_10 = __VLS_9({
                ...{ 'onClick': {} },
                trigger: "click",
            }, ...__VLS_functionalComponentArgsRest(__VLS_9));
            let __VLS_13;
            const __VLS_14 = ({ click: {} },
                { onClick: () => { } });
            const { default: __VLS_15 } = __VLS_11.slots;
            let __VLS_16;
            /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
            elIcon;
            // @ts-ignore
            const __VLS_17 = __VLS_asFunctionalComponent1(__VLS_16, new __VLS_16({
                ...{ class: "more-icon" },
            }));
            const __VLS_18 = __VLS_17({
                ...{ class: "more-icon" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_17));
            /** @type {__VLS_StyleScopedClasses['more-icon']} */ ;
            const { default: __VLS_21 } = __VLS_19.slots;
            let __VLS_22;
            /** @ts-ignore @type {typeof __VLS_components.MoreFilled} */
            MoreFilled;
            // @ts-ignore
            const __VLS_23 = __VLS_asFunctionalComponent1(__VLS_22, new __VLS_22({}));
            const __VLS_24 = __VLS_23({}, ...__VLS_functionalComponentArgsRest(__VLS_23));
            // @ts-ignore
            [batchMode, getCharacterName, getCharacterName,];
            var __VLS_19;
            {
                const { dropdown: __VLS_27 } = __VLS_11.slots;
                let __VLS_28;
                /** @ts-ignore @type {typeof __VLS_components.elDropdownMenu | typeof __VLS_components.ElDropdownMenu | typeof __VLS_components.elDropdownMenu | typeof __VLS_components.ElDropdownMenu} */
                elDropdownMenu;
                // @ts-ignore
                const __VLS_29 = __VLS_asFunctionalComponent1(__VLS_28, new __VLS_28({}));
                const __VLS_30 = __VLS_29({}, ...__VLS_functionalComponentArgsRest(__VLS_29));
                const { default: __VLS_33 } = __VLS_31.slots;
                let __VLS_34;
                /** @ts-ignore @type {typeof __VLS_components.elDropdownItem | typeof __VLS_components.ElDropdownItem | typeof __VLS_components.elDropdownItem | typeof __VLS_components.ElDropdownItem} */
                elDropdownItem;
                // @ts-ignore
                const __VLS_35 = __VLS_asFunctionalComponent1(__VLS_34, new __VLS_34({
                    ...{ 'onClick': {} },
                }));
                const __VLS_36 = __VLS_35({
                    ...{ 'onClick': {} },
                }, ...__VLS_functionalComponentArgsRest(__VLS_35));
                let __VLS_39;
                const __VLS_40 = ({ click: {} },
                    { onClick: (...[$event]) => {
                            if (!(__VLS_ctx.groupedConversations.today.length > 0))
                                return;
                            if (!(!__VLS_ctx.batchMode))
                                return;
                            __VLS_ctx.$emit('delete', conv.id);
                            // @ts-ignore
                            [$emit,];
                        } });
                const { default: __VLS_41 } = __VLS_37.slots;
                // @ts-ignore
                [];
                var __VLS_37;
                var __VLS_38;
                // @ts-ignore
                [];
                var __VLS_31;
                // @ts-ignore
                [];
            }
            // @ts-ignore
            [];
            var __VLS_11;
            var __VLS_12;
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "conversation-title" },
        });
        /** @type {__VLS_StyleScopedClasses['conversation-title']} */ ;
        (conv.title);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "conversation-time" },
        });
        /** @type {__VLS_StyleScopedClasses['conversation-time']} */ ;
        (__VLS_ctx.formatTime(conv.updatedAt));
        // @ts-ignore
        [formatTime,];
    }
}
if (__VLS_ctx.groupedConversations.yesterday.length > 0) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "group-title" },
    });
    /** @type {__VLS_StyleScopedClasses['group-title']} */ ;
    for (const [conv] of __VLS_vFor((__VLS_ctx.groupedConversations.yesterday))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.groupedConversations.yesterday.length > 0))
                        return;
                    __VLS_ctx.handleClick(conv.id);
                    // @ts-ignore
                    [groupedConversations, groupedConversations, handleClick,];
                } },
            key: (conv.id),
            ...{ class: "conversation-item" },
            ...{ class: ({ active: __VLS_ctx.currentConversationId === conv.id }) },
        });
        /** @type {__VLS_StyleScopedClasses['conversation-item']} */ ;
        /** @type {__VLS_StyleScopedClasses['active']} */ ;
        if (__VLS_ctx.batchMode) {
            let __VLS_42;
            /** @ts-ignore @type {typeof __VLS_components.elCheckbox | typeof __VLS_components.ElCheckbox} */
            elCheckbox;
            // @ts-ignore
            const __VLS_43 = __VLS_asFunctionalComponent1(__VLS_42, new __VLS_42({
                ...{ 'onClick': {} },
                ...{ 'onChange': {} },
                modelValue: (__VLS_ctx.selectedIds.includes(conv.id)),
                ...{ class: "conversation-checkbox" },
            }));
            const __VLS_44 = __VLS_43({
                ...{ 'onClick': {} },
                ...{ 'onChange': {} },
                modelValue: (__VLS_ctx.selectedIds.includes(conv.id)),
                ...{ class: "conversation-checkbox" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_43));
            let __VLS_47;
            const __VLS_48 = ({ click: {} },
                { onClick: () => { } });
            const __VLS_49 = ({ change: {} },
                { onChange: (...[$event]) => {
                        if (!(__VLS_ctx.groupedConversations.yesterday.length > 0))
                            return;
                        if (!(__VLS_ctx.batchMode))
                            return;
                        __VLS_ctx.$emit('toggleSelect', conv.id);
                        // @ts-ignore
                        [currentConversationId, batchMode, selectedIds, $emit,];
                    } });
            /** @type {__VLS_StyleScopedClasses['conversation-checkbox']} */ ;
            var __VLS_45;
            var __VLS_46;
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "conversation-content" },
        });
        /** @type {__VLS_StyleScopedClasses['conversation-content']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "conversation-header" },
        });
        /** @type {__VLS_StyleScopedClasses['conversation-header']} */ ;
        if (__VLS_ctx.getCharacterName(conv.characterId)) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "character-name" },
            });
            /** @type {__VLS_StyleScopedClasses['character-name']} */ ;
            (__VLS_ctx.getCharacterName(conv.characterId));
        }
        if (!__VLS_ctx.batchMode) {
            let __VLS_50;
            /** @ts-ignore @type {typeof __VLS_components.elDropdown | typeof __VLS_components.ElDropdown | typeof __VLS_components.elDropdown | typeof __VLS_components.ElDropdown} */
            elDropdown;
            // @ts-ignore
            const __VLS_51 = __VLS_asFunctionalComponent1(__VLS_50, new __VLS_50({
                ...{ 'onClick': {} },
                trigger: "click",
            }));
            const __VLS_52 = __VLS_51({
                ...{ 'onClick': {} },
                trigger: "click",
            }, ...__VLS_functionalComponentArgsRest(__VLS_51));
            let __VLS_55;
            const __VLS_56 = ({ click: {} },
                { onClick: () => { } });
            const { default: __VLS_57 } = __VLS_53.slots;
            let __VLS_58;
            /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
            elIcon;
            // @ts-ignore
            const __VLS_59 = __VLS_asFunctionalComponent1(__VLS_58, new __VLS_58({
                ...{ class: "more-icon" },
            }));
            const __VLS_60 = __VLS_59({
                ...{ class: "more-icon" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_59));
            /** @type {__VLS_StyleScopedClasses['more-icon']} */ ;
            const { default: __VLS_63 } = __VLS_61.slots;
            let __VLS_64;
            /** @ts-ignore @type {typeof __VLS_components.MoreFilled} */
            MoreFilled;
            // @ts-ignore
            const __VLS_65 = __VLS_asFunctionalComponent1(__VLS_64, new __VLS_64({}));
            const __VLS_66 = __VLS_65({}, ...__VLS_functionalComponentArgsRest(__VLS_65));
            // @ts-ignore
            [batchMode, getCharacterName, getCharacterName,];
            var __VLS_61;
            {
                const { dropdown: __VLS_69 } = __VLS_53.slots;
                let __VLS_70;
                /** @ts-ignore @type {typeof __VLS_components.elDropdownMenu | typeof __VLS_components.ElDropdownMenu | typeof __VLS_components.elDropdownMenu | typeof __VLS_components.ElDropdownMenu} */
                elDropdownMenu;
                // @ts-ignore
                const __VLS_71 = __VLS_asFunctionalComponent1(__VLS_70, new __VLS_70({}));
                const __VLS_72 = __VLS_71({}, ...__VLS_functionalComponentArgsRest(__VLS_71));
                const { default: __VLS_75 } = __VLS_73.slots;
                let __VLS_76;
                /** @ts-ignore @type {typeof __VLS_components.elDropdownItem | typeof __VLS_components.ElDropdownItem | typeof __VLS_components.elDropdownItem | typeof __VLS_components.ElDropdownItem} */
                elDropdownItem;
                // @ts-ignore
                const __VLS_77 = __VLS_asFunctionalComponent1(__VLS_76, new __VLS_76({
                    ...{ 'onClick': {} },
                }));
                const __VLS_78 = __VLS_77({
                    ...{ 'onClick': {} },
                }, ...__VLS_functionalComponentArgsRest(__VLS_77));
                let __VLS_81;
                const __VLS_82 = ({ click: {} },
                    { onClick: (...[$event]) => {
                            if (!(__VLS_ctx.groupedConversations.yesterday.length > 0))
                                return;
                            if (!(!__VLS_ctx.batchMode))
                                return;
                            __VLS_ctx.$emit('delete', conv.id);
                            // @ts-ignore
                            [$emit,];
                        } });
                const { default: __VLS_83 } = __VLS_79.slots;
                // @ts-ignore
                [];
                var __VLS_79;
                var __VLS_80;
                // @ts-ignore
                [];
                var __VLS_73;
                // @ts-ignore
                [];
            }
            // @ts-ignore
            [];
            var __VLS_53;
            var __VLS_54;
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "conversation-title" },
        });
        /** @type {__VLS_StyleScopedClasses['conversation-title']} */ ;
        (conv.title);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "conversation-time" },
        });
        /** @type {__VLS_StyleScopedClasses['conversation-time']} */ ;
        (__VLS_ctx.formatTime(conv.updatedAt));
        // @ts-ignore
        [formatTime,];
    }
}
if (__VLS_ctx.groupedConversations.earlier.length > 0) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "group-title" },
    });
    /** @type {__VLS_StyleScopedClasses['group-title']} */ ;
    for (const [conv] of __VLS_vFor((__VLS_ctx.groupedConversations.earlier))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.groupedConversations.earlier.length > 0))
                        return;
                    __VLS_ctx.handleClick(conv.id);
                    // @ts-ignore
                    [groupedConversations, groupedConversations, handleClick,];
                } },
            key: (conv.id),
            ...{ class: "conversation-item" },
            ...{ class: ({ active: __VLS_ctx.currentConversationId === conv.id }) },
        });
        /** @type {__VLS_StyleScopedClasses['conversation-item']} */ ;
        /** @type {__VLS_StyleScopedClasses['active']} */ ;
        if (__VLS_ctx.batchMode) {
            let __VLS_84;
            /** @ts-ignore @type {typeof __VLS_components.elCheckbox | typeof __VLS_components.ElCheckbox} */
            elCheckbox;
            // @ts-ignore
            const __VLS_85 = __VLS_asFunctionalComponent1(__VLS_84, new __VLS_84({
                ...{ 'onClick': {} },
                ...{ 'onChange': {} },
                modelValue: (__VLS_ctx.selectedIds.includes(conv.id)),
                ...{ class: "conversation-checkbox" },
            }));
            const __VLS_86 = __VLS_85({
                ...{ 'onClick': {} },
                ...{ 'onChange': {} },
                modelValue: (__VLS_ctx.selectedIds.includes(conv.id)),
                ...{ class: "conversation-checkbox" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_85));
            let __VLS_89;
            const __VLS_90 = ({ click: {} },
                { onClick: () => { } });
            const __VLS_91 = ({ change: {} },
                { onChange: (...[$event]) => {
                        if (!(__VLS_ctx.groupedConversations.earlier.length > 0))
                            return;
                        if (!(__VLS_ctx.batchMode))
                            return;
                        __VLS_ctx.$emit('toggleSelect', conv.id);
                        // @ts-ignore
                        [currentConversationId, batchMode, selectedIds, $emit,];
                    } });
            /** @type {__VLS_StyleScopedClasses['conversation-checkbox']} */ ;
            var __VLS_87;
            var __VLS_88;
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "conversation-content" },
        });
        /** @type {__VLS_StyleScopedClasses['conversation-content']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "conversation-header" },
        });
        /** @type {__VLS_StyleScopedClasses['conversation-header']} */ ;
        if (__VLS_ctx.getCharacterName(conv.characterId)) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "character-name" },
            });
            /** @type {__VLS_StyleScopedClasses['character-name']} */ ;
            (__VLS_ctx.getCharacterName(conv.characterId));
        }
        if (!__VLS_ctx.batchMode) {
            let __VLS_92;
            /** @ts-ignore @type {typeof __VLS_components.elDropdown | typeof __VLS_components.ElDropdown | typeof __VLS_components.elDropdown | typeof __VLS_components.ElDropdown} */
            elDropdown;
            // @ts-ignore
            const __VLS_93 = __VLS_asFunctionalComponent1(__VLS_92, new __VLS_92({
                ...{ 'onClick': {} },
                trigger: "click",
            }));
            const __VLS_94 = __VLS_93({
                ...{ 'onClick': {} },
                trigger: "click",
            }, ...__VLS_functionalComponentArgsRest(__VLS_93));
            let __VLS_97;
            const __VLS_98 = ({ click: {} },
                { onClick: () => { } });
            const { default: __VLS_99 } = __VLS_95.slots;
            let __VLS_100;
            /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
            elIcon;
            // @ts-ignore
            const __VLS_101 = __VLS_asFunctionalComponent1(__VLS_100, new __VLS_100({
                ...{ class: "more-icon" },
            }));
            const __VLS_102 = __VLS_101({
                ...{ class: "more-icon" },
            }, ...__VLS_functionalComponentArgsRest(__VLS_101));
            /** @type {__VLS_StyleScopedClasses['more-icon']} */ ;
            const { default: __VLS_105 } = __VLS_103.slots;
            let __VLS_106;
            /** @ts-ignore @type {typeof __VLS_components.MoreFilled} */
            MoreFilled;
            // @ts-ignore
            const __VLS_107 = __VLS_asFunctionalComponent1(__VLS_106, new __VLS_106({}));
            const __VLS_108 = __VLS_107({}, ...__VLS_functionalComponentArgsRest(__VLS_107));
            // @ts-ignore
            [batchMode, getCharacterName, getCharacterName,];
            var __VLS_103;
            {
                const { dropdown: __VLS_111 } = __VLS_95.slots;
                let __VLS_112;
                /** @ts-ignore @type {typeof __VLS_components.elDropdownMenu | typeof __VLS_components.ElDropdownMenu | typeof __VLS_components.elDropdownMenu | typeof __VLS_components.ElDropdownMenu} */
                elDropdownMenu;
                // @ts-ignore
                const __VLS_113 = __VLS_asFunctionalComponent1(__VLS_112, new __VLS_112({}));
                const __VLS_114 = __VLS_113({}, ...__VLS_functionalComponentArgsRest(__VLS_113));
                const { default: __VLS_117 } = __VLS_115.slots;
                let __VLS_118;
                /** @ts-ignore @type {typeof __VLS_components.elDropdownItem | typeof __VLS_components.ElDropdownItem | typeof __VLS_components.elDropdownItem | typeof __VLS_components.ElDropdownItem} */
                elDropdownItem;
                // @ts-ignore
                const __VLS_119 = __VLS_asFunctionalComponent1(__VLS_118, new __VLS_118({
                    ...{ 'onClick': {} },
                }));
                const __VLS_120 = __VLS_119({
                    ...{ 'onClick': {} },
                }, ...__VLS_functionalComponentArgsRest(__VLS_119));
                let __VLS_123;
                const __VLS_124 = ({ click: {} },
                    { onClick: (...[$event]) => {
                            if (!(__VLS_ctx.groupedConversations.earlier.length > 0))
                                return;
                            if (!(!__VLS_ctx.batchMode))
                                return;
                            __VLS_ctx.$emit('delete', conv.id);
                            // @ts-ignore
                            [$emit,];
                        } });
                const { default: __VLS_125 } = __VLS_121.slots;
                // @ts-ignore
                [];
                var __VLS_121;
                var __VLS_122;
                // @ts-ignore
                [];
                var __VLS_115;
                // @ts-ignore
                [];
            }
            // @ts-ignore
            [];
            var __VLS_95;
            var __VLS_96;
        }
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "conversation-title" },
        });
        /** @type {__VLS_StyleScopedClasses['conversation-title']} */ ;
        (conv.title);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "conversation-time" },
        });
        /** @type {__VLS_StyleScopedClasses['conversation-time']} */ ;
        (__VLS_ctx.formatTime(conv.updatedAt));
        // @ts-ignore
        [formatTime,];
    }
}
if (__VLS_ctx.conversations.length === 0) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "empty-state" },
    });
    /** @type {__VLS_StyleScopedClasses['empty-state']} */ ;
    let __VLS_126;
    /** @ts-ignore @type {typeof __VLS_components.elEmpty | typeof __VLS_components.ElEmpty} */
    elEmpty;
    // @ts-ignore
    const __VLS_127 = __VLS_asFunctionalComponent1(__VLS_126, new __VLS_126({
        description: "暂无对话历史",
    }));
    const __VLS_128 = __VLS_127({
        description: "暂无对话历史",
    }, ...__VLS_functionalComponentArgsRest(__VLS_127));
}
// @ts-ignore
[conversations,];
const __VLS_export = (await import('vue')).defineComponent({
    __typeEmits: {},
    __typeProps: {},
});
export default {};
