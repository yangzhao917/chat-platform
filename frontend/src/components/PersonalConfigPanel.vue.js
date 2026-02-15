/// <reference types="../../node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { useUserProfileStore } from '@/stores/userProfile';
import { useCharacterStore } from '@/stores/character';
const emit = defineEmits();
const userProfileStore = useUserProfileStore();
const characterStore = useCharacterStore();
const modes = ref([]);
const form = ref({
    defaultModeId: null,
});
const saving = ref(false);
onMounted(async () => {
    // 加载预设模式
    await characterStore.fetchCharacters();
    modes.value = characterStore.characters.filter((char) => char.metadata?.isPreset === true);
    // 加载用户配置
    await userProfileStore.fetchProfile();
    if (userProfileStore.profile) {
        form.value.defaultModeId = userProfileStore.profile.defaultModeId;
    }
    // 如果用户没有选择默认模式，自动选择第一个
    if (!form.value.defaultModeId && modes.value.length > 0) {
        form.value.defaultModeId = modes.value[0].id;
    }
});
const selectMode = (modeId) => {
    form.value.defaultModeId = modeId;
};
const saveConfig = async () => {
    saving.value = true;
    try {
        await userProfileStore.upsertProfile({
            defaultModeId: form.value.defaultModeId,
        });
        emit('success');
    }
    catch (error) {
        ElMessage.error('保存失败');
    }
    finally {
        saving.value = false;
    }
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
/** @type {__VLS_StyleScopedClasses['mode-card']} */ ;
/** @type {__VLS_StyleScopedClasses['mode-card']} */ ;
/** @type {__VLS_StyleScopedClasses['tip-item']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "personal-config-panel" },
});
/** @type {__VLS_StyleScopedClasses['personal-config-panel']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "section" },
});
/** @type {__VLS_StyleScopedClasses['section']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
    ...{ class: "section-title" },
});
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ class: "section-desc" },
});
/** @type {__VLS_StyleScopedClasses['section-desc']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "mode-cards" },
});
/** @type {__VLS_StyleScopedClasses['mode-cards']} */ ;
for (const [mode] of __VLS_vFor((__VLS_ctx.modes))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.selectMode(mode.id);
                // @ts-ignore
                [modes, selectMode,];
            } },
        key: (mode.id),
        ...{ class: "mode-card" },
        ...{ class: ({ active: __VLS_ctx.form.defaultModeId === mode.id }) },
    });
    /** @type {__VLS_StyleScopedClasses['mode-card']} */ ;
    /** @type {__VLS_StyleScopedClasses['active']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "mode-icon" },
    });
    /** @type {__VLS_StyleScopedClasses['mode-icon']} */ ;
    (mode.metadata?.icon || '💬');
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "mode-name" },
    });
    /** @type {__VLS_StyleScopedClasses['mode-name']} */ ;
    (mode.name);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "mode-desc" },
    });
    /** @type {__VLS_StyleScopedClasses['mode-desc']} */ ;
    (mode.description);
    // @ts-ignore
    [form,];
}
let __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
elButton;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    ...{ 'onClick': {} },
    type: "primary",
    loading: (__VLS_ctx.saving),
}));
const __VLS_2 = __VLS_1({
    ...{ 'onClick': {} },
    type: "primary",
    loading: (__VLS_ctx.saving),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_5;
const __VLS_6 = ({ click: {} },
    { onClick: (__VLS_ctx.saveConfig) });
const { default: __VLS_7 } = __VLS_3.slots;
// @ts-ignore
[saving, saveConfig,];
var __VLS_3;
var __VLS_4;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({
    __typeEmits: {},
});
export default {};
