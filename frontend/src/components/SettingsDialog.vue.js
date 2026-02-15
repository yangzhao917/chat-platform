/// <reference types="../../node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { User, Setting } from '@element-plus/icons-vue';
import AboutYouPanel from './AboutYouPanel.vue';
import PersonalConfigPanel from './PersonalConfigPanel.vue';
const props = defineProps();
const emit = defineEmits();
const activeMenu = ref('about-you');
const visible = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val),
});
const handleMenuSelect = (index) => {
    activeMenu.value = index;
};
const handleSaveSuccess = () => {
    ElMessage.success('保存成功');
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
let __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog | typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog} */
elDialog;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    modelValue: (__VLS_ctx.visible),
    title: "设置",
    width: "800px",
    closeOnClickModal: (false),
}));
const __VLS_2 = __VLS_1({
    modelValue: (__VLS_ctx.visible),
    title: "设置",
    width: "800px",
    closeOnClickModal: (false),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
var __VLS_5 = {};
const { default: __VLS_6 } = __VLS_3.slots;
let __VLS_7;
/** @ts-ignore @type {typeof __VLS_components.elContainer | typeof __VLS_components.ElContainer | typeof __VLS_components.elContainer | typeof __VLS_components.ElContainer} */
elContainer;
// @ts-ignore
const __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7({
    ...{ style: {} },
}));
const __VLS_9 = __VLS_8({
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_8));
const { default: __VLS_12 } = __VLS_10.slots;
let __VLS_13;
/** @ts-ignore @type {typeof __VLS_components.elAside | typeof __VLS_components.ElAside | typeof __VLS_components.elAside | typeof __VLS_components.ElAside} */
elAside;
// @ts-ignore
const __VLS_14 = __VLS_asFunctionalComponent1(__VLS_13, new __VLS_13({
    width: "180px",
    ...{ class: "settings-sidebar" },
}));
const __VLS_15 = __VLS_14({
    width: "180px",
    ...{ class: "settings-sidebar" },
}, ...__VLS_functionalComponentArgsRest(__VLS_14));
/** @type {__VLS_StyleScopedClasses['settings-sidebar']} */ ;
const { default: __VLS_18 } = __VLS_16.slots;
let __VLS_19;
/** @ts-ignore @type {typeof __VLS_components.elMenu | typeof __VLS_components.ElMenu | typeof __VLS_components.elMenu | typeof __VLS_components.ElMenu} */
elMenu;
// @ts-ignore
const __VLS_20 = __VLS_asFunctionalComponent1(__VLS_19, new __VLS_19({
    ...{ 'onSelect': {} },
    defaultActive: (__VLS_ctx.activeMenu),
}));
const __VLS_21 = __VLS_20({
    ...{ 'onSelect': {} },
    defaultActive: (__VLS_ctx.activeMenu),
}, ...__VLS_functionalComponentArgsRest(__VLS_20));
let __VLS_24;
const __VLS_25 = ({ select: {} },
    { onSelect: (__VLS_ctx.handleMenuSelect) });
const { default: __VLS_26 } = __VLS_22.slots;
let __VLS_27;
/** @ts-ignore @type {typeof __VLS_components.elMenuItem | typeof __VLS_components.ElMenuItem | typeof __VLS_components.elMenuItem | typeof __VLS_components.ElMenuItem} */
elMenuItem;
// @ts-ignore
const __VLS_28 = __VLS_asFunctionalComponent1(__VLS_27, new __VLS_27({
    index: "about-you",
}));
const __VLS_29 = __VLS_28({
    index: "about-you",
}, ...__VLS_functionalComponentArgsRest(__VLS_28));
const { default: __VLS_32 } = __VLS_30.slots;
let __VLS_33;
/** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
elIcon;
// @ts-ignore
const __VLS_34 = __VLS_asFunctionalComponent1(__VLS_33, new __VLS_33({}));
const __VLS_35 = __VLS_34({}, ...__VLS_functionalComponentArgsRest(__VLS_34));
const { default: __VLS_38 } = __VLS_36.slots;
let __VLS_39;
/** @ts-ignore @type {typeof __VLS_components.User} */
User;
// @ts-ignore
const __VLS_40 = __VLS_asFunctionalComponent1(__VLS_39, new __VLS_39({}));
const __VLS_41 = __VLS_40({}, ...__VLS_functionalComponentArgsRest(__VLS_40));
// @ts-ignore
[visible, activeMenu, handleMenuSelect,];
var __VLS_36;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
// @ts-ignore
[];
var __VLS_30;
let __VLS_44;
/** @ts-ignore @type {typeof __VLS_components.elMenuItem | typeof __VLS_components.ElMenuItem | typeof __VLS_components.elMenuItem | typeof __VLS_components.ElMenuItem} */
elMenuItem;
// @ts-ignore
const __VLS_45 = __VLS_asFunctionalComponent1(__VLS_44, new __VLS_44({
    index: "personal-config",
}));
const __VLS_46 = __VLS_45({
    index: "personal-config",
}, ...__VLS_functionalComponentArgsRest(__VLS_45));
const { default: __VLS_49 } = __VLS_47.slots;
let __VLS_50;
/** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
elIcon;
// @ts-ignore
const __VLS_51 = __VLS_asFunctionalComponent1(__VLS_50, new __VLS_50({}));
const __VLS_52 = __VLS_51({}, ...__VLS_functionalComponentArgsRest(__VLS_51));
const { default: __VLS_55 } = __VLS_53.slots;
let __VLS_56;
/** @ts-ignore @type {typeof __VLS_components.Setting} */
Setting;
// @ts-ignore
const __VLS_57 = __VLS_asFunctionalComponent1(__VLS_56, new __VLS_56({}));
const __VLS_58 = __VLS_57({}, ...__VLS_functionalComponentArgsRest(__VLS_57));
// @ts-ignore
[];
var __VLS_53;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
// @ts-ignore
[];
var __VLS_47;
// @ts-ignore
[];
var __VLS_22;
var __VLS_23;
// @ts-ignore
[];
var __VLS_16;
let __VLS_61;
/** @ts-ignore @type {typeof __VLS_components.elMain | typeof __VLS_components.ElMain | typeof __VLS_components.elMain | typeof __VLS_components.ElMain} */
elMain;
// @ts-ignore
const __VLS_62 = __VLS_asFunctionalComponent1(__VLS_61, new __VLS_61({
    ...{ class: "settings-content" },
}));
const __VLS_63 = __VLS_62({
    ...{ class: "settings-content" },
}, ...__VLS_functionalComponentArgsRest(__VLS_62));
/** @type {__VLS_StyleScopedClasses['settings-content']} */ ;
const { default: __VLS_66 } = __VLS_64.slots;
if (__VLS_ctx.activeMenu === 'about-you') {
    const __VLS_67 = AboutYouPanel;
    // @ts-ignore
    const __VLS_68 = __VLS_asFunctionalComponent1(__VLS_67, new __VLS_67({
        ...{ 'onSuccess': {} },
    }));
    const __VLS_69 = __VLS_68({
        ...{ 'onSuccess': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_68));
    let __VLS_72;
    const __VLS_73 = ({ success: {} },
        { onSuccess: (__VLS_ctx.handleSaveSuccess) });
    var __VLS_70;
    var __VLS_71;
}
if (__VLS_ctx.activeMenu === 'personal-config') {
    const __VLS_74 = PersonalConfigPanel;
    // @ts-ignore
    const __VLS_75 = __VLS_asFunctionalComponent1(__VLS_74, new __VLS_74({
        ...{ 'onSuccess': {} },
    }));
    const __VLS_76 = __VLS_75({
        ...{ 'onSuccess': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_75));
    let __VLS_79;
    const __VLS_80 = ({ success: {} },
        { onSuccess: (__VLS_ctx.handleSaveSuccess) });
    var __VLS_77;
    var __VLS_78;
}
// @ts-ignore
[activeMenu, activeMenu, handleSaveSuccess, handleSaveSuccess,];
var __VLS_64;
// @ts-ignore
[];
var __VLS_10;
// @ts-ignore
[];
var __VLS_3;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({
    __typeEmits: {},
    __typeProps: {},
});
export default {};
