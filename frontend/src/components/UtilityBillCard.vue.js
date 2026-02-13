/// <reference types="../../node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../node_modules/@vue/language-core/types/props-fallback.d.ts" />
const props = defineProps();
// 获取状态标签类型
const getStatusType = (status) => {
    switch (status) {
        case 'paid':
            return 'success';
        case 'unpaid':
            return 'warning';
        case 'overdue':
            return 'danger';
        default:
            return 'info';
    }
};
// 获取状态文本
const getStatusText = (status) => {
    switch (status) {
        case 'paid':
            return '已支付';
        case 'unpaid':
            return '待支付';
        case 'overdue':
            return '已逾期';
        default:
            return '';
    }
};
const __VLS_ctx = {
    ...{},
    ...{},
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
let __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.elCard | typeof __VLS_components.ElCard | typeof __VLS_components.elCard | typeof __VLS_components.ElCard} */
elCard;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    ...{ class: "utility-bill-card" },
    shadow: "hover",
}));
const __VLS_2 = __VLS_1({
    ...{ class: "utility-bill-card" },
    shadow: "hover",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
var __VLS_5 = {};
/** @type {__VLS_StyleScopedClasses['utility-bill-card']} */ ;
const { default: __VLS_6 } = __VLS_3.slots;
{
    const { header: __VLS_7 } = __VLS_3.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "card-header" },
    });
    /** @type {__VLS_StyleScopedClasses['card-header']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "card-title" },
    });
    /** @type {__VLS_StyleScopedClasses['card-title']} */ ;
    (__VLS_ctx.cardData.title || '账单详情');
    if (__VLS_ctx.cardData.status) {
        let __VLS_8;
        /** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
        elTag;
        // @ts-ignore
        const __VLS_9 = __VLS_asFunctionalComponent1(__VLS_8, new __VLS_8({
            type: (__VLS_ctx.getStatusType(__VLS_ctx.cardData.status)),
            size: "small",
        }));
        const __VLS_10 = __VLS_9({
            type: (__VLS_ctx.getStatusType(__VLS_ctx.cardData.status)),
            size: "small",
        }, ...__VLS_functionalComponentArgsRest(__VLS_9));
        const { default: __VLS_13 } = __VLS_11.slots;
        (__VLS_ctx.getStatusText(__VLS_ctx.cardData.status));
        // @ts-ignore
        [cardData, cardData, cardData, cardData, getStatusType, getStatusText,];
        var __VLS_11;
    }
    // @ts-ignore
    [];
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "bill-items" },
});
/** @type {__VLS_StyleScopedClasses['bill-items']} */ ;
for (const [item, index] of __VLS_vFor((__VLS_ctx.cardData.items))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        key: (index),
        ...{ class: "bill-item" },
        ...{ class: ({ 'bill-item-highlight': item.highlight }) },
    });
    /** @type {__VLS_StyleScopedClasses['bill-item']} */ ;
    /** @type {__VLS_StyleScopedClasses['bill-item-highlight']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "item-label" },
    });
    /** @type {__VLS_StyleScopedClasses['item-label']} */ ;
    (item.label);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "item-value" },
    });
    /** @type {__VLS_StyleScopedClasses['item-value']} */ ;
    (item.value);
    if (item.unit) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "item-unit" },
        });
        /** @type {__VLS_StyleScopedClasses['item-unit']} */ ;
        (item.unit);
    }
    // @ts-ignore
    [cardData,];
}
if (__VLS_ctx.cardData.total) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "bill-total" },
    });
    /** @type {__VLS_StyleScopedClasses['bill-total']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "total-label" },
    });
    /** @type {__VLS_StyleScopedClasses['total-label']} */ ;
    (__VLS_ctx.cardData.total.label);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "total-value" },
    });
    /** @type {__VLS_StyleScopedClasses['total-value']} */ ;
    (__VLS_ctx.cardData.total.value);
}
if (__VLS_ctx.cardData.dueDate) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "bill-footer" },
    });
    /** @type {__VLS_StyleScopedClasses['bill-footer']} */ ;
    (__VLS_ctx.cardData.dueDate);
}
// @ts-ignore
[cardData, cardData, cardData, cardData, cardData,];
var __VLS_3;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({
    __typeProps: {},
});
export default {};
