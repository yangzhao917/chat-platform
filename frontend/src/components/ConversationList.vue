<template>
  <div class="conversation-list">
    <div v-if="groupedConversations.today.length > 0">
      <div class="group-title">今天</div>
      <div
        v-for="conv in groupedConversations.today"
        :key="conv.id"
        class="conversation-item"
        :class="{ active: currentConversationId === conv.id }"
        @click="handleClick(conv.id)"
      >
        <el-checkbox
          v-if="batchMode"
          :model-value="selectedIds.includes(conv.id)"
          @click.stop
          @change="$emit('toggleSelect', conv.id)"
          class="conversation-checkbox"
        />
        <div class="conversation-content">
          <div class="conversation-header">
            <div v-if="getCharacterName(conv.characterId)" class="character-name">
              {{ getCharacterName(conv.characterId) }}
            </div>
            <el-dropdown v-if="!batchMode" trigger="click" @click.stop>
              <el-icon class="more-icon"><MoreFilled /></el-icon>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="$emit('delete', conv.id)">
                    删除
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
          <div class="conversation-title">{{ conv.title }}</div>
          <div class="conversation-time">{{ formatTime(conv.updatedAt) }}</div>
        </div>
      </div>
    </div>

    <div v-if="groupedConversations.yesterday.length > 0">
      <div class="group-title">昨天</div>
      <div
        v-for="conv in groupedConversations.yesterday"
        :key="conv.id"
        class="conversation-item"
        :class="{ active: currentConversationId === conv.id }"
        @click="handleClick(conv.id)"
      >
        <el-checkbox
          v-if="batchMode"
          :model-value="selectedIds.includes(conv.id)"
          @click.stop
          @change="$emit('toggleSelect', conv.id)"
          class="conversation-checkbox"
        />
        <div class="conversation-content">
          <div class="conversation-header">
            <div v-if="getCharacterName(conv.characterId)" class="character-name">
              {{ getCharacterName(conv.characterId) }}
            </div>
            <el-dropdown v-if="!batchMode" trigger="click" @click.stop>
              <el-icon class="more-icon"><MoreFilled /></el-icon>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="$emit('delete', conv.id)">
                    删除
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
          <div class="conversation-title">{{ conv.title }}</div>
          <div class="conversation-time">{{ formatTime(conv.updatedAt) }}</div>
        </div>
      </div>
    </div>

    <div v-if="groupedConversations.earlier.length > 0">
      <div class="group-title">更早</div>
      <div
        v-for="conv in groupedConversations.earlier"
        :key="conv.id"
        class="conversation-item"
        :class="{ active: currentConversationId === conv.id }"
        @click="handleClick(conv.id)"
      >
        <el-checkbox
          v-if="batchMode"
          :model-value="selectedIds.includes(conv.id)"
          @click.stop
          @change="$emit('toggleSelect', conv.id)"
          class="conversation-checkbox"
        />
        <div class="conversation-content">
          <div class="conversation-header">
            <div v-if="getCharacterName(conv.characterId)" class="character-name">
              {{ getCharacterName(conv.characterId) }}
            </div>
            <el-dropdown v-if="!batchMode" trigger="click" @click.stop>
              <el-icon class="more-icon"><MoreFilled /></el-icon>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="$emit('delete', conv.id)">
                    删除
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
          <div class="conversation-title">{{ conv.title }}</div>
          <div class="conversation-time">{{ formatTime(conv.updatedAt) }}</div>
        </div>
      </div>
    </div>

    <div v-if="conversations.length === 0" class="empty-state">
      <el-empty description="暂无对话历史" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { MoreFilled } from '@element-plus/icons-vue';
import type { Conversation } from '@/types';
import { useCharacterStore } from '@/stores/character';

const props = defineProps<{
  conversations: Conversation[];
  currentConversationId: string;
  batchMode: boolean;
  selectedIds: string[];
}>();

const emit = defineEmits<{
  select: [id: string];
  delete: [id: string];
  toggleSelect: [id: string];
}>();

const characterStore = useCharacterStore();

// 创建角色ID到名称的映射，提升性能
const characterNameMap = computed(() => {
  const map = new Map<string, string>();
  characterStore.characters.forEach(char => {
    map.set(char.id, char.name);
  });
  return map;
});

// 获取角色名称，角色不存在时返回空字符串
const getCharacterName = (characterId: string): string => {
  return characterNameMap.value.get(characterId) || '';
};

const handleClick = (id: string) => {
  if (props.batchMode) {
    // 批量模式下，点击切换选择状态
    emit('toggleSelect', id);
  } else {
    // 正常模式下，点击选择对话
    emit('select', id);
  }
};

const groupedConversations = computed(() => {
  const groups = {
    today: [] as Conversation[],
    yesterday: [] as Conversation[],
    earlier: [] as Conversation[],
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
    } else if (convDate.getTime() === yesterday.getTime()) {
      groups.yesterday.push(conv);
    } else {
      groups.earlier.push(conv);
    }
  });

  return groups;
});

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};
</script>

<style scoped>
.conversation-list {
  padding: 12px;
}

.group-title {
  font-size: 12px;
  color: #909399;
  margin: 12px 0 8px 4px;
  font-weight: 500;
}

.conversation-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 12px;
  margin-bottom: 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  background-color: transparent;
}

.conversation-item:hover {
  background-color: #f5f7fa;
}

.conversation-item.active {
  background-color: #ecf5ff;
}

.conversation-checkbox {
  flex-shrink: 0;
  margin-top: 2px;
}

.conversation-content {
  flex: 1;
  min-width: 0;
}

.conversation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.character-name {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.more-icon {
  color: #909399;
  cursor: pointer;
  padding: 4px;
}

.more-icon:hover {
  color: #606266;
}

.conversation-title {
  font-size: 13px;
  color: #606266;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.conversation-time {
  font-size: 12px;
  color: #909399;
}

.empty-state {
  padding: 40px 20px;
}
</style>
