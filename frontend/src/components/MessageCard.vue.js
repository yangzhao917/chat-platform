/// <reference types="../../node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { computed } from 'vue';
import { Warning } from '@element-plus/icons-vue';
import UtilityBillCard from './UtilityBillCard.vue';
import { marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css';
// 配置marked
marked.use(markedHighlight({
    highlight(code, lang) {
        if (lang && hljs.getLanguage(lang)) {
            return hljs.highlight(code, { language: lang }).value;
        }
        return hljs.highlightAuto(code).value;
    }
}));
marked.setOptions({
    breaks: true, // 支持GFM换行
    gfm: true, // 启用GitHub Flavored Markdown
});
const props = defineProps();
const isCardMessage = computed(() => {
    return props.metadata?.renderType === 'card';
});
const isTextMessage = computed(() => {
    return !props.metadata?.renderType || props.metadata.renderType === 'text';
});
const hasImage = computed(() => {
    return !!props.metadata?.imageUrl;
});
const renderedContent = computed(() => {
    if (!isTextMessage.value)
        return '';
    // 流式输出时返回纯文本，避免高频Markdown解析
    if (props.isStreaming) {
        return props.content;
    }
    // 流式结束后才解析Markdown
    return marked(props.content);
});
const __VLS_ctx = {
    ...{},
    ...{},
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['message-text']} */ ;
/** @type {__VLS_StyleScopedClasses['message-text']} */ ;
/** @type {__VLS_StyleScopedClasses['message-text']} */ ;
/** @type {__VLS_StyleScopedClasses['message-text']} */ ;
/** @type {__VLS_StyleScopedClasses['message-text']} */ ;
/** @type {__VLS_StyleScopedClasses['message-text']} */ ;
/** @type {__VLS_StyleScopedClasses['message-text']} */ ;
/** @type {__VLS_StyleScopedClasses['message-text']} */ ;
/** @type {__VLS_StyleScopedClasses['message-text']} */ ;
/** @type {__VLS_StyleScopedClasses['message-text']} */ ;
/** @type {__VLS_StyleScopedClasses['message-text']} */ ;
/** @type {__VLS_StyleScopedClasses['message-text']} */ ;
/** @type {__VLS_StyleScopedClasses['message-text']} */ ;
/** @type {__VLS_StyleScopedClasses['message-text']} */ ;
/** @type {__VLS_StyleScopedClasses['message-text']} */ ;
/** @type {__VLS_StyleScopedClasses['message-text']} */ ;
/** @type {__VLS_StyleScopedClasses['message-text']} */ ;
/** @type {__VLS_StyleScopedClasses['message-text']} */ ;
/** @type {__VLS_StyleScopedClasses['message-text']} */ ;
/** @type {__VLS_StyleScopedClasses['message-text']} */ ;
/** @type {__VLS_StyleScopedClasses['message-text']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "message-card-wrapper" },
});
/** @type {__VLS_StyleScopedClasses['message-card-wrapper']} */ ;
if (__VLS_ctx.hasImage) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "message-image" },
    });
    /** @type {__VLS_StyleScopedClasses['message-image']} */ ;
    let __VLS_0;
    /** @ts-ignore @type {typeof __VLS_components.elImage | typeof __VLS_components.ElImage} */
    elImage;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
        src: (__VLS_ctx.metadata?.imageUrl),
        fit: "cover",
        previewSrcList: ([__VLS_ctx.metadata?.imageUrl || '']),
        ...{ class: "image-content" },
    }));
    const __VLS_2 = __VLS_1({
        src: (__VLS_ctx.metadata?.imageUrl),
        fit: "cover",
        previewSrcList: ([__VLS_ctx.metadata?.imageUrl || '']),
        ...{ class: "image-content" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    /** @type {__VLS_StyleScopedClasses['image-content']} */ ;
}
if (__VLS_ctx.isTextMessage && __VLS_ctx.isStreaming) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "message-text-plain" },
    });
    /** @type {__VLS_StyleScopedClasses['message-text-plain']} */ ;
    (__VLS_ctx.content);
}
else if (__VLS_ctx.isTextMessage) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "message-text" },
    });
    __VLS_asFunctionalDirective(__VLS_directives.vHtml, {})(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.renderedContent) }, null, null);
    /** @type {__VLS_StyleScopedClasses['message-text']} */ ;
}
else if (__VLS_ctx.isCardMessage) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "message-card-container" },
    });
    /** @type {__VLS_StyleScopedClasses['message-card-container']} */ ;
    if (__VLS_ctx.content) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "card-description" },
        });
        /** @type {__VLS_StyleScopedClasses['card-description']} */ ;
        (__VLS_ctx.content);
    }
    if (__VLS_ctx.metadata?.cardType === 'utility-bill') {
        const __VLS_5 = UtilityBillCard;
        // @ts-ignore
        const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
            cardData: __VLS_ctx.metadata.cardData,
        }));
        const __VLS_7 = __VLS_6({
            cardData: __VLS_ctx.metadata.cardData,
        }, ...__VLS_functionalComponentArgsRest(__VLS_6));
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "unknown-card" },
        });
        /** @type {__VLS_StyleScopedClasses['unknown-card']} */ ;
        let __VLS_10;
        /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
        elIcon;
        // @ts-ignore
        const __VLS_11 = __VLS_asFunctionalComponent1(__VLS_10, new __VLS_10({}));
        const __VLS_12 = __VLS_11({}, ...__VLS_functionalComponentArgsRest(__VLS_11));
        const { default: __VLS_15 } = __VLS_13.slots;
        let __VLS_16;
        /** @ts-ignore @type {typeof __VLS_components.Warning} */
        Warning;
        // @ts-ignore
        const __VLS_17 = __VLS_asFunctionalComponent1(__VLS_16, new __VLS_16({}));
        const __VLS_18 = __VLS_17({}, ...__VLS_functionalComponentArgsRest(__VLS_17));
        // @ts-ignore
        [hasImage, metadata, metadata, metadata, metadata, isTextMessage, isTextMessage, isStreaming, content, content, content, renderedContent, isCardMessage,];
        var __VLS_13;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    }
}
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({
    __typeProps: {},
});
export default {};
