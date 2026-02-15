/// <reference types="../../node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, computed, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import { useUserProfileStore } from '@/stores/userProfile';
const emit = defineEmits();
const userProfileStore = useUserProfileStore();
const form = ref({
    name: '',
    occupation: '',
    hobbies: [],
    bio: '',
    avatarUrl: '',
});
const avatarFile = ref(null);
const saving = ref(false);
const commonHobbies = [
    '阅读',
    '写作',
    '运动',
    '旅行',
    '摄影',
    '音乐',
    '电影',
    '游戏',
    '编程',
    '绘画',
    '烹饪',
    '园艺',
    '瑜伽',
    '健身',
];
const avatarPreview = computed(() => {
    if (avatarFile.value) {
        return URL.createObjectURL(avatarFile.value);
    }
    return userProfileStore.profile?.avatarUrl || '';
});
onMounted(async () => {
    await userProfileStore.fetchProfile();
    if (userProfileStore.profile) {
        form.value.name = userProfileStore.profile.name || '';
        form.value.occupation = userProfileStore.profile.occupation || '';
        form.value.hobbies = userProfileStore.profile.hobbies || [];
        form.value.bio = userProfileStore.profile.bio || '';
        form.value.avatarUrl = userProfileStore.profile.avatarUrl || '';
    }
});
const handleAvatarChange = async (uploadFile) => {
    const file = uploadFile.raw;
    // 验证文件类型
    if (!file.type.startsWith('image/')) {
        ElMessage.error('请上传图片文件');
        return;
    }
    // 验证文件大小（5MB）
    if (file.size > 5 * 1024 * 1024) {
        ElMessage.error('图片大小不能超过5MB');
        return;
    }
    avatarFile.value = file;
    await uploadAvatar();
};
const uploadAvatar = async () => {
    if (!avatarFile.value)
        return;
    saving.value = true;
    try {
        await userProfileStore.uploadAvatar(avatarFile.value);
        await userProfileStore.fetchProfile();
        ElMessage.success('头像上传成功');
    }
    catch (error) {
        ElMessage.error('头像上传失败');
    }
    finally {
        saving.value = false;
    }
};
const saveProfile = async () => {
    saving.value = true;
    try {
        await userProfileStore.upsertProfile({
            name: form.value.name,
            occupation: form.value.occupation,
            hobbies: form.value.hobbies,
            bio: form.value.bio,
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
let __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.elForm | typeof __VLS_components.ElForm | typeof __VLS_components.elForm | typeof __VLS_components.ElForm} */
elForm;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    model: (__VLS_ctx.form),
    labelWidth: "100px",
}));
const __VLS_2 = __VLS_1({
    model: (__VLS_ctx.form),
    labelWidth: "100px",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
var __VLS_5 = {};
const { default: __VLS_6 } = __VLS_3.slots;
let __VLS_7;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7({
    label: "头像",
}));
const __VLS_9 = __VLS_8({
    label: "头像",
}, ...__VLS_functionalComponentArgsRest(__VLS_8));
const { default: __VLS_12 } = __VLS_10.slots;
let __VLS_13;
/** @ts-ignore @type {typeof __VLS_components.elUpload | typeof __VLS_components.ElUpload | typeof __VLS_components.elUpload | typeof __VLS_components.ElUpload} */
elUpload;
// @ts-ignore
const __VLS_14 = __VLS_asFunctionalComponent1(__VLS_13, new __VLS_13({
    autoUpload: (false),
    showFileList: (false),
    accept: "image/*",
    onChange: (__VLS_ctx.handleAvatarChange),
}));
const __VLS_15 = __VLS_14({
    autoUpload: (false),
    showFileList: (false),
    accept: "image/*",
    onChange: (__VLS_ctx.handleAvatarChange),
}, ...__VLS_functionalComponentArgsRest(__VLS_14));
const { default: __VLS_18 } = __VLS_16.slots;
let __VLS_19;
/** @ts-ignore @type {typeof __VLS_components.elAvatar | typeof __VLS_components.ElAvatar | typeof __VLS_components.elAvatar | typeof __VLS_components.ElAvatar} */
elAvatar;
// @ts-ignore
const __VLS_20 = __VLS_asFunctionalComponent1(__VLS_19, new __VLS_19({
    size: (80),
    src: (__VLS_ctx.avatarPreview),
    shape: "circle",
}));
const __VLS_21 = __VLS_20({
    size: (80),
    src: (__VLS_ctx.avatarPreview),
    shape: "circle",
}, ...__VLS_functionalComponentArgsRest(__VLS_20));
const { default: __VLS_24 } = __VLS_22.slots;
let __VLS_25;
/** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
elIcon;
// @ts-ignore
const __VLS_26 = __VLS_asFunctionalComponent1(__VLS_25, new __VLS_25({}));
const __VLS_27 = __VLS_26({}, ...__VLS_functionalComponentArgsRest(__VLS_26));
const { default: __VLS_30 } = __VLS_28.slots;
let __VLS_31;
/** @ts-ignore @type {typeof __VLS_components.Plus} */
Plus;
// @ts-ignore
const __VLS_32 = __VLS_asFunctionalComponent1(__VLS_31, new __VLS_31({}));
const __VLS_33 = __VLS_32({}, ...__VLS_functionalComponentArgsRest(__VLS_32));
// @ts-ignore
[form, handleAvatarChange, avatarPreview,];
var __VLS_28;
// @ts-ignore
[];
var __VLS_22;
// @ts-ignore
[];
var __VLS_16;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "form-hint" },
});
/** @type {__VLS_StyleScopedClasses['form-hint']} */ ;
// @ts-ignore
[];
var __VLS_10;
let __VLS_36;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_37 = __VLS_asFunctionalComponent1(__VLS_36, new __VLS_36({
    label: "昵称",
}));
const __VLS_38 = __VLS_37({
    label: "昵称",
}, ...__VLS_functionalComponentArgsRest(__VLS_37));
const { default: __VLS_41 } = __VLS_39.slots;
let __VLS_42;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_43 = __VLS_asFunctionalComponent1(__VLS_42, new __VLS_42({
    modelValue: (__VLS_ctx.form.name),
    placeholder: "请输入昵称",
    maxlength: "100",
    showWordLimit: true,
}));
const __VLS_44 = __VLS_43({
    modelValue: (__VLS_ctx.form.name),
    placeholder: "请输入昵称",
    maxlength: "100",
    showWordLimit: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_43));
// @ts-ignore
[form,];
var __VLS_39;
let __VLS_47;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_48 = __VLS_asFunctionalComponent1(__VLS_47, new __VLS_47({
    label: "职业",
}));
const __VLS_49 = __VLS_48({
    label: "职业",
}, ...__VLS_functionalComponentArgsRest(__VLS_48));
const { default: __VLS_52 } = __VLS_50.slots;
let __VLS_53;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_54 = __VLS_asFunctionalComponent1(__VLS_53, new __VLS_53({
    modelValue: (__VLS_ctx.form.occupation),
    placeholder: "请输入职业",
    maxlength: "100",
}));
const __VLS_55 = __VLS_54({
    modelValue: (__VLS_ctx.form.occupation),
    placeholder: "请输入职业",
    maxlength: "100",
}, ...__VLS_functionalComponentArgsRest(__VLS_54));
// @ts-ignore
[form,];
var __VLS_50;
let __VLS_58;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_59 = __VLS_asFunctionalComponent1(__VLS_58, new __VLS_58({
    label: "爱好",
}));
const __VLS_60 = __VLS_59({
    label: "爱好",
}, ...__VLS_functionalComponentArgsRest(__VLS_59));
const { default: __VLS_63 } = __VLS_61.slots;
let __VLS_64;
/** @ts-ignore @type {typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect} */
elSelect;
// @ts-ignore
const __VLS_65 = __VLS_asFunctionalComponent1(__VLS_64, new __VLS_64({
    modelValue: (__VLS_ctx.form.hobbies),
    multiple: true,
    filterable: true,
    allowCreate: true,
    placeholder: "选择或输入爱好",
    ...{ style: {} },
}));
const __VLS_66 = __VLS_65({
    modelValue: (__VLS_ctx.form.hobbies),
    multiple: true,
    filterable: true,
    allowCreate: true,
    placeholder: "选择或输入爱好",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_65));
const { default: __VLS_69 } = __VLS_67.slots;
for (const [hobby] of __VLS_vFor((__VLS_ctx.commonHobbies))) {
    let __VLS_70;
    /** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
    elOption;
    // @ts-ignore
    const __VLS_71 = __VLS_asFunctionalComponent1(__VLS_70, new __VLS_70({
        key: (hobby),
        label: (hobby),
        value: (hobby),
    }));
    const __VLS_72 = __VLS_71({
        key: (hobby),
        label: (hobby),
        value: (hobby),
    }, ...__VLS_functionalComponentArgsRest(__VLS_71));
    // @ts-ignore
    [form, commonHobbies,];
}
// @ts-ignore
[];
var __VLS_67;
// @ts-ignore
[];
var __VLS_61;
let __VLS_75;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_76 = __VLS_asFunctionalComponent1(__VLS_75, new __VLS_75({
    label: "个人简介",
}));
const __VLS_77 = __VLS_76({
    label: "个人简介",
}, ...__VLS_functionalComponentArgsRest(__VLS_76));
const { default: __VLS_80 } = __VLS_78.slots;
let __VLS_81;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_82 = __VLS_asFunctionalComponent1(__VLS_81, new __VLS_81({
    modelValue: (__VLS_ctx.form.bio),
    type: "textarea",
    rows: (4),
    placeholder: "简单介绍一下自己...",
    maxlength: "500",
    showWordLimit: true,
}));
const __VLS_83 = __VLS_82({
    modelValue: (__VLS_ctx.form.bio),
    type: "textarea",
    rows: (4),
    placeholder: "简单介绍一下自己...",
    maxlength: "500",
    showWordLimit: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_82));
// @ts-ignore
[form,];
var __VLS_78;
let __VLS_86;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_87 = __VLS_asFunctionalComponent1(__VLS_86, new __VLS_86({}));
const __VLS_88 = __VLS_87({}, ...__VLS_functionalComponentArgsRest(__VLS_87));
const { default: __VLS_91 } = __VLS_89.slots;
let __VLS_92;
/** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
elButton;
// @ts-ignore
const __VLS_93 = __VLS_asFunctionalComponent1(__VLS_92, new __VLS_92({
    ...{ 'onClick': {} },
    type: "primary",
    loading: (__VLS_ctx.saving),
}));
const __VLS_94 = __VLS_93({
    ...{ 'onClick': {} },
    type: "primary",
    loading: (__VLS_ctx.saving),
}, ...__VLS_functionalComponentArgsRest(__VLS_93));
let __VLS_97;
const __VLS_98 = ({ click: {} },
    { onClick: (__VLS_ctx.saveProfile) });
const { default: __VLS_99 } = __VLS_95.slots;
// @ts-ignore
[saving, saveProfile,];
var __VLS_95;
var __VLS_96;
// @ts-ignore
[];
var __VLS_89;
// @ts-ignore
[];
var __VLS_3;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({
    __typeEmits: {},
});
export default {};
