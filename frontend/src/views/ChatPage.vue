<template>
  <div class="chat-page">
    <el-container style="height: 100%">
      <!-- 左侧角色列表 -->
      <el-aside width="280px" class="sidebar">
        <div class="aside-header">
          <el-button type="primary" size="large" class="create-btn" @click="showCreateDialog = true">
            <el-icon style="margin-right: 8px"><Plus /></el-icon>
            创建角色
          </el-button>
        </div>
        <el-scrollbar height="calc(100% - 90px)">
          <div class="character-list">
            <div
              v-for="char in characterStore.characters"
              :key="char.id"
              class="character-item"
              :class="{ active: currentCharacterId === char.id }"
              @click="selectCharacter(char.id)"
            >
              <div class="character-info">
                <div class="character-name">{{ char.name }}</div>
                <div class="character-desc">{{ char.description }}</div>
              </div>
              <el-button
                v-if="!char.metadata?.isPreset"
                type="danger"
                size="small"
                text
                circle
                @click.stop="deleteCharacter(char.id)"
              >
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </div>
        </el-scrollbar>
      </el-aside>

      <!-- 右侧聊天区域 -->
      <el-container class="chat-container">
        <el-main v-if="!currentCharacterId" class="empty-state">
          <el-empty description="请选择一个角色开始对话" />
        </el-main>

        <template v-else>
          <el-header height="70px" class="chat-header-container">
            <div class="chat-header">
              <div class="header-left">
                <h3>{{ characterStore.currentCharacter?.name }}</h3>
                <p class="header-hint">内容由 AI 生成，请注意甄别</p>
              </div>
              <el-button text @click="clearChat">
                <el-icon style="margin-right: 4px"><Delete /></el-icon>
                清空对话
              </el-button>
            </div>
          </el-header>

          <el-main class="chat-main">
            <el-scrollbar ref="scrollbarRef" height="100%">
              <div class="message-list">
                <div
                  v-for="msg in chatStore.messages"
                  :key="msg.id"
                  class="message-item"
                  :class="msg.role"
                >
                  <div class="message-avatar">
                    <el-avatar v-if="msg.role === 'user'" :size="36">
                      <el-icon><User /></el-icon>
                    </el-avatar>
                    <el-avatar v-else :size="36" style="background-color: #409eff">
                      <el-icon><ChatDotRound /></el-icon>
                    </el-avatar>
                  </div>
                  <div class="message-content">
                    <MessageCard
                      :content="msg.content"
                      :metadata="msg.metadata"
                      :isStreaming="chatStore.streaming && msg === chatStore.messages[chatStore.messages.length - 1]"
                    />
                  </div>
                </div>
              </div>
            </el-scrollbar>
          </el-main>

          <el-footer height="auto" class="chat-footer">
            <div class="model-selector">
              <el-select v-model="chatStore.aiModel" size="small" style="width: 200px" placeholder="选择模型">
                <el-option
                  v-for="model in availableModels"
                  :key="model.value"
                  :value="model.value"
                  :label="model.label"
                >
                  <div style="display: flex; align-items: center;">
                    <el-icon style="margin-right: 4px">
                      <Lightning v-if="model.icon === 'lightning'" />
                      <MagicStick v-else />
                    </el-icon>
                    <span>{{ model.label }}</span>
                  </div>
                </el-option>
              </el-select>
            </div>
            <div class="input-area">
              <!-- 图片预览 -->
              <div v-if="selectedImage" class="image-preview">
                <el-image :src="selectedImage.preview" fit="cover" class="preview-image" />
                <el-button
                  type="danger"
                  size="small"
                  circle
                  class="remove-image-btn"
                  @click="removeImage"
                >
                  <el-icon><Close /></el-icon>
                </el-button>
              </div>
              <div class="input-row">
                <el-upload
                  ref="uploadRef"
                  :auto-upload="false"
                  :show-file-list="false"
                  accept="image/*"
                  :on-change="handleImageSelect"
                >
                  <el-button circle size="large" class="image-btn">
                    <el-icon><Picture /></el-icon>
                  </el-button>
                </el-upload>
                <el-input
                  v-model="inputMessage"
                  type="textarea"
                  :rows="4"
                  placeholder="输入消息... (Ctrl+Enter 发送)"
                  class="input-box"
                  @keydown.enter.ctrl="sendMessage"
                />
                <el-button
                  type="primary"
                  circle
                  size="large"
                  class="send-btn"
                  :loading="chatStore.streaming"
                  :disabled="!inputMessage.trim() && !selectedImage"
                  @click="sendMessage"
                >
                  <el-icon v-if="!chatStore.streaming"><Promotion /></el-icon>
                </el-button>
              </div>
            </div>
          </el-footer>
        </template>
      </el-container>
    </el-container>

    <!-- 创建角色对话框 -->
    <el-dialog v-model="showCreateDialog" title="创建角色" width="500px">
      <el-form :model="createForm" label-width="80px">
        <el-form-item label="角色名称">
          <el-input v-model="createForm.name" maxlength="100" show-word-limit />
        </el-form-item>
        <el-form-item label="简介">
          <el-input v-model="createForm.description" maxlength="500" show-word-limit />
        </el-form-item>
        <el-form-item label="背景故事">
          <el-input
            v-model="createForm.backgroundStory"
            type="textarea"
            :rows="4"
            maxlength="2000"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" :loading="characterStore.loading" @click="createCharacter">
          创建
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Delete, User, ChatDotRound, Promotion, Lightning, MagicStick, Picture, Close } from '@element-plus/icons-vue';
import type { UploadFile } from 'element-plus';
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
const selectedImage = ref<{ file: File; preview: string } | null>(null);
const uploadRef = ref();
const availableModels = ref<Array<{ value: string; label: string; icon: string }>>([]);
const abortController = ref<AbortController | null>(null);
const selectRequestId = ref(0);
let scrollPending = false;  // 滚动节流标志

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
      const isCurrentModelAvailable = result.data.some((m: any) => m.value === currentModel);
      if (!isCurrentModelAvailable) {
        chatStore.aiModel = result.data[0].value;
      }
    }
  } catch (error) {
    console.error('获取可用模型失败:', error);
    ElMessage.error('获取可用模型失败');
  }
});

const selectCharacter = async (id: string) => {
  // 生成新的请求ID
  const requestId = ++selectRequestId.value;

  // 取消正在进行的 SSE 请求
  if (abortController.value) {
    abortController.value.abort();
    chatStore.streaming = false;
  }

  // 立即更新 UI，提供即时反馈
  currentCharacterId.value = id;

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
  } catch (error) {
    // 只有最新请求才显示错误
    if (requestId === selectRequestId.value) {
      ElMessage.error('切换角色失败');
    }
  }
};

const deleteCharacter = async (id: string) => {
  try {
    await ElMessageBox.confirm('确认删除该角色？', '提示', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning',
    });
    await characterStore.deleteCharacter(id);
    ElMessage.success('删除成功');
  } catch {
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
  } catch (error) {
    ElMessage.error('创建失败');
  }
};

const handleImageSelect = async (uploadFile: UploadFile) => {
  if (!uploadFile.raw) return;

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
  } catch (error) {
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

const uploadImage = async (file: File): Promise<string> => {
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
  if ((!inputMessage.value.trim() && !selectedImage.value) || chatStore.streaming) return;

  const content = inputMessage.value.trim() || '请看这张图片';
  let imageUrl: string | undefined;

  // 如果有图片，先上传
  if (selectedImage.value) {
    try {
      imageUrl = await uploadImage(selectedImage.value.file);
    } catch (error) {
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
        imageUrl,
        model: chatStore.aiModel
      }),
      signal: abortController.value.signal,
    });

    if (!response.body) throw new Error('No response body');

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let assistantContent = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.trim()) continue;
        const [eventLine, dataLine] = line.split('\n');
        if (!eventLine?.startsWith('event:') || !dataLine?.startsWith('data:')) continue;

        const event = eventLine.substring(6).trim();
        const data = JSON.parse(dataLine.substring(5).trim());

        if (event === 'token') {
          assistantContent += data.content;
          chatStore.updateLastMessage(assistantContent);
          scrollToBottom();
        } else if (event === 'error') {
          throw new Error(data.error);
        }
      }
    }
  } catch (error: any) {
    // 区分用户主动取消和真实错误
    if (error.name === 'AbortError') {
      // 用户主动取消，不显示错误
      console.log('请求已取消');
    } else {
      ElMessage.error(error.message || '发送消息失败');
    }
  } finally {
    clearTimeout(timeoutId);
    chatStore.streaming = false;
    abortController.value = null;
  }
};

const clearChat = async () => {
  try {
    await ElMessageBox.confirm('确认清空对话记录？', '提示', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning',
    });

    // 取消正在进行的 SSE 请求
    if (abortController.value) {
      abortController.value.abort();
      chatStore.streaming = false;
    }

    await chatStore.clearHistory(currentCharacterId.value);
    ElMessage.success('已清空对话');
  } catch {
    // 用户取消
  }
};

const scrollToBottom = () => {
  if (scrollPending) return;
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
</script>

<style scoped>
.chat-page {
  width: 100%;
  height: 100vh;
  background-color: #f5f7fa;
}

/* 左侧边栏样式 */
.sidebar {
  background-color: #ffffff;
  border-right: 1px solid #e4e7ed;
}

.aside-header {
  padding: 20px 16px;
  border-bottom: 1px solid #e4e7ed;
}

.create-btn {
  width: 100%;
  border-radius: 8px;
  font-weight: 500;
}

.character-list {
  padding: 12px;
}

.character-item {
  padding: 12px;
  margin-bottom: 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: transparent;
}

.character-item:hover {
  background-color: #f5f7fa;
}

.character-item.active {
  background-color: #ecf5ff;
}

.character-info {
  flex: 1;
  overflow: hidden;
}

.character-name {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
  color: #303133;
}

.character-desc {
  font-size: 12px;
  color: #909399;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 聊天区域样式 */
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #ffffff;
}

.chat-header-container {
  background-color: #ffffff;
  border-bottom: 1px solid #e4e7ed;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  padding: 0 24px;
}

.header-left h3 {
  font-size: 16px;
  font-weight: 500;
  margin: 0 0 4px 0;
  color: #303133;
}

.header-hint {
  font-size: 12px;
  color: #909399;
  margin: 0;
}

.chat-main {
  flex: 1;
  background-color: #ffffff;
  padding: 0;
  overflow: hidden;
}

.message-list {
  padding: 24px;
  max-width: 900px;
  margin: 0 auto;
}

.message-item {
  margin-bottom: 24px;
  display: flex;
  gap: 12px;
}

.message-item.user {
  flex-direction: row-reverse;
}

.message-avatar {
  flex-shrink: 0;
}

.message-content {
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 8px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
  font-size: 14px;
}

.message-item.user .message-content {
  background-color: #409eff;
  color: white;
}

.message-item.assistant .message-content {
  background-color: #f5f7fa;
  color: #303133;
}

.chat-footer {
  flex-shrink: 0;
  background-color: #ffffff;
  border-top: 1px solid #e4e7ed;
  padding: 0;
}

.model-selector {
  padding: 12px 24px 0 24px;
  max-width: 900px;
  margin: 0 auto;
  display: flex;
  justify-content: flex-start;
}

.input-area {
  padding: 20px 24px;
  max-width: 900px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  box-sizing: border-box;
}

.image-preview {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 8px;
  overflow: hidden;
}

.preview-image {
  width: 100%;
  height: 100%;
}

.remove-image-btn {
  position: absolute;
  top: 4px;
  right: 4px;
}

.input-row {
  display: flex;
  gap: 12px;
  align-items: flex-end;
}

.image-btn {
  flex-shrink: 0;
  width: 44px;
  height: 44px;
}

.input-box {
  flex: 1;
}

.input-box :deep(.el-textarea__inner) {
  border-radius: 8px;
  padding: 12px;
  font-size: 14px;
  resize: none;
}

.send-btn {
  flex-shrink: 0;
  width: 44px;
  height: 44px;
}
</style>
