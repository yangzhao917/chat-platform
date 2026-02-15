<template>
  <div class="sidebar">
    <!-- 对话历史列表 -->
    <div class="sidebar-content">
      <div class="aside-header">
        <!-- 创建新对话按钮 -->
        <el-button type="primary" style="width: 100%; margin-bottom: 12px" @click="handleQuickCreate">
          <el-icon><Plus /></el-icon>
          <span>创建新对话</span>
        </el-button>

        <!-- 搜索框 -->
        <el-input
          v-model="searchKeyword"
          placeholder="搜索对话..."
          size="small"
          clearable
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>

        <!-- 批量操作工具栏 -->
        <div v-if="!batchMode" class="toolbar">
          <el-button text size="small" @click="enterBatchMode">
            <el-icon><Operation /></el-icon>
            <span>批量管理</span>
          </el-button>
        </div>
        <div v-else class="batch-toolbar">
          <el-checkbox v-model="selectAll" @change="handleSelectAll">全选</el-checkbox>
          <div class="batch-actions">
            <el-button text type="danger" size="small" :disabled="selectedIds.length === 0" @click="batchDelete">
              删除 ({{ selectedIds.length }})
            </el-button>
            <el-button text size="small" @click="exitBatchMode">取消</el-button>
          </div>
        </div>
      </div>
      <el-scrollbar height="calc(100vh - 220px)">
        <ConversationList
          :conversations="filteredConversations"
          :current-conversation-id="conversationStore.currentConversation?.id || ''"
          :batch-mode="batchMode"
          :selected-ids="selectedIds"
          @select="selectConversation"
          @delete="deleteConversation"
          @toggle-select="toggleSelect"
        />
      </el-scrollbar>
    </div>

    <!-- 底部设置按钮 -->
    <div class="sidebar-footer">
      <el-button text @click="showSettings = true" style="width: 100%">
        <el-icon><Setting /></el-icon>
        <span>设置</span>
      </el-button>
    </div>

    <!-- 设置弹出层 -->
    <SettingsDialog v-model="showSettings" />
  </div>
</template>

<script setup lang="ts">
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
const selectedIds = ref<string[]>([]);
const selectAll = ref(false);
const creating = ref(false);

const defaultModeId = computed(() => userProfileStore.profile?.defaultModeId);

const filteredConversations = computed(() => {
  if (!searchKeyword.value) return conversationStore.conversations;
  return conversationStore.conversations.filter((conv) =>
    conv.title.toLowerCase().includes(searchKeyword.value.toLowerCase())
  );
});

onMounted(async () => {
  await Promise.all([
    conversationStore.fetchConversations(),
    characterStore.fetchCharacters(),
    userProfileStore.fetchProfile(),
  ]);
});

const selectConversation = async (id: string) => {
  if (batchMode.value) return;
  await conversationStore.selectConversation(id);
};

const deleteConversation = async (id: string) => {
  try {
    await ElMessageBox.confirm('确认删除此对话？', '提示', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning',
    });
    await conversationStore.deleteConversation(id);
    ElMessage.success('删除成功');
  } catch {
    // 用户取消
  }
};

const handleQuickCreate = async () => {
  // 防止重复点击
  if (creating.value) return;
  creating.value = true;

  try {
    // 1. 获取默认角色ID
    let characterId = defaultModeId.value;

    // 2. 如果没有设置，使用第一个预设角色
    if (!characterId) {
      const presetCharacters = characterStore.characters.filter(
        (char) => char.metadata?.isPreset === true
      );

      if (presetCharacters.length > 0) {
        characterId = presetCharacters[0].id;
      } else {
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
      const presetCharacters = characterStore.characters.filter(
        (char) => char.metadata?.isPreset === true
      );
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
  } catch (error) {
    console.error('进入新对话模式失败:', error);
    ElMessage.error('进入新对话模式失败');
  } finally {
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

const toggleSelect = (id: string) => {
  const index = selectedIds.value.indexOf(id);
  if (index > -1) {
    selectedIds.value.splice(index, 1);
  } else {
    selectedIds.value.push(id);
  }
  selectAll.value = selectedIds.value.length === filteredConversations.value.length;
};

const handleSelectAll = (checked: boolean) => {
  if (checked) {
    selectedIds.value = filteredConversations.value.map((conv) => conv.id);
  } else {
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
  } catch {
    // 用户取消
  }
};
</script>

<style scoped>
.sidebar {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #ffffff;
}

.sidebar-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.aside-header {
  padding: 16px;
  border-bottom: 1px solid #e4e7ed;
}

.toolbar {
  margin-top: 12px;
  display: flex;
  justify-content: flex-end;
}

.batch-toolbar {
  margin-top: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.batch-actions {
  display: flex;
  gap: 8px;
}

.sidebar-footer {
  border-top: 1px solid #e4e7ed;
  padding: 12px 16px;
}
</style>
