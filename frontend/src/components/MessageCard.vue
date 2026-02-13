<script setup lang="ts">
import { computed } from 'vue';
import { Warning } from '@element-plus/icons-vue';
import type { MessageMetadata, UtilityBillCardData } from '@/types';
import UtilityBillCard from './UtilityBillCard.vue';
import { marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css';

// 配置marked
marked.use(
  markedHighlight({
    highlight(code: string, lang: string) {
      if (lang && hljs.getLanguage(lang)) {
        return hljs.highlight(code, { language: lang }).value;
      }
      return hljs.highlightAuto(code).value;
    }
  })
);

marked.setOptions({
  breaks: true,  // 支持GFM换行
  gfm: true,     // 启用GitHub Flavored Markdown
});

interface Props {
  content: string;
  metadata: MessageMetadata | null;
  isStreaming?: boolean;  // 是否正在流式输出
}

const props = defineProps<Props>();

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
  if (!isTextMessage.value) return '';
  // 流式输出时返回纯文本，避免高频Markdown解析
  if (props.isStreaming) {
    return props.content;
  }
  // 流式结束后才解析Markdown
  return marked(props.content);
});
</script>

<template>
  <div class="message-card-wrapper">
    <!-- 图片消息 -->
    <div v-if="hasImage" class="message-image">
      <el-image
        :src="metadata?.imageUrl"
        fit="cover"
        :preview-src-list="[metadata?.imageUrl || '']"
        class="image-content"
      />
    </div>

    <!-- 纯文本渲染（默认） -->
    <!-- 流式输出时显示纯文本 -->
    <div v-if="isTextMessage && isStreaming" class="message-text-plain">
      {{ content }}
    </div>
    <!-- 流式结束后显示Markdown -->
    <div v-else-if="isTextMessage" class="message-text" v-html="renderedContent"></div>

    <!-- 卡片渲染 -->
    <div v-else-if="isCardMessage" class="message-card-container">
      <!-- 可选文本描述 -->
      <div v-if="content" class="card-description">{{ content }}</div>

      <!-- 水电费卡片 -->
      <UtilityBillCard
        v-if="metadata?.cardType === 'utility-bill'"
        :card-data="metadata.cardData as UtilityBillCardData"
      />

      <!-- 未知卡片类型 -->
      <div v-else class="unknown-card">
        <el-icon><Warning /></el-icon>
        <span>未知的卡片类型</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.message-card-wrapper {
  width: 100%;
}

.message-image {
  margin-bottom: 8px;
}

.image-content {
  max-width: 100%;
  max-height: 300px;
  border-radius: 8px;
  cursor: pointer;
}

.message-text {
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.6;
}

.message-text-plain {
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.6;
}

/* Markdown样式 */
.message-text :deep(pre) {
  background: #f6f8fa;
  padding: 12px;
  border-radius: 6px;
  overflow-x: auto;
  margin: 8px 0;
}

.message-text :deep(code) {
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 0.9em;
}

.message-text :deep(pre code) {
  background: transparent;
  padding: 0;
}

.message-text :deep(p code) {
  background: #f6f8fa;
  padding: 2px 6px;
  border-radius: 3px;
}

.message-text :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 12px 0;
}

.message-text :deep(th),
.message-text :deep(td) {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

.message-text :deep(th) {
  background-color: #f6f8fa;
  font-weight: 600;
}

.message-text :deep(ul),
.message-text :deep(ol) {
  padding-left: 24px;
  margin: 8px 0;
}

.message-text :deep(blockquote) {
  border-left: 4px solid #ddd;
  padding-left: 12px;
  margin: 8px 0;
  color: #666;
}

.message-text :deep(h1),
.message-text :deep(h2),
.message-text :deep(h3),
.message-text :deep(h4),
.message-text :deep(h5),
.message-text :deep(h6) {
  margin: 16px 0 8px 0;
  font-weight: 600;
}

.message-text :deep(p) {
  margin: 8px 0;
}

.message-text :deep(a) {
  color: #409eff;
  text-decoration: none;
}

.message-text :deep(a:hover) {
  text-decoration: underline;
}

.message-card-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.card-description {
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.6;
  color: #606266;
  font-size: 14px;
}

.unknown-card {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background-color: #f5f7fa;
  border-radius: 6px;
  color: #909399;
  font-size: 14px;
}
</style>
