<template>
  <div class="personal-config-panel">
    <div class="section">
      <h3 class="section-title">默认回复风格</h3>
      <p class="section-desc">选择一个默认的回复风格，你也可以在对话中随时调整</p>

      <div class="mode-cards">
        <div
          v-for="mode in modes"
          :key="mode.id"
          class="mode-card"
          :class="{ active: form.defaultModeId === mode.id }"
          @click="selectMode(mode.id)"
        >
          <div class="mode-icon">{{ mode.metadata?.icon || '💬' }}</div>
          <div class="mode-name">{{ mode.name }}</div>
          <div class="mode-desc">{{ mode.description }}</div>
        </div>
      </div>
    </div>

    <el-button type="primary" @click="saveConfig" :loading="saving">
      保存
    </el-button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { useUserProfileStore } from '@/stores/userProfile';
import { useCharacterStore } from '@/stores/character';
import type { Character } from '@/types';

const emit = defineEmits<{ success: [] }>();

const userProfileStore = useUserProfileStore();
const characterStore = useCharacterStore();

const modes = ref<Character[]>([]);
const form = ref({
  defaultModeId: null as string | null,
});

const saving = ref(false);

onMounted(async () => {
  // 加载预设模式
  await characterStore.fetchCharacters();
  modes.value = characterStore.characters.filter(
    (char) => char.metadata?.isPreset === true
  );

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

const selectMode = (modeId: string) => {
  form.value.defaultModeId = modeId;
};

const saveConfig = async () => {
  saving.value = true;
  try {
    await userProfileStore.upsertProfile({
      defaultModeId: form.value.defaultModeId,
    });
    emit('success');
  } catch (error) {
    ElMessage.error('保存失败');
  } finally {
    saving.value = false;
  }
};
</script>

<style scoped>
.personal-config-panel {
  max-width: 800px;
}

.section {
  margin-bottom: 32px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}

.section-desc {
  font-size: 14px;
  color: #606266;
  margin-bottom: 16px;
}

.mode-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.mode-card {
  padding: 20px;
  border: 2px solid #e4e7ed;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
}

.mode-card:hover {
  border-color: #409eff;
  background-color: #f5f7fa;
}

.mode-card.active {
  border-color: #409eff;
  background-color: #ecf5ff;
}

.mode-icon {
  font-size: 32px;
  margin-bottom: 12px;
}

.mode-name {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}

.mode-desc {
  font-size: 14px;
  color: #606266;
}

.tips-list {
  background-color: #f5f7fa;
  padding: 16px;
  border-radius: 8px;
}

.tip-item {
  margin-bottom: 12px;
  font-size: 14px;
}

.tip-item:last-child {
  margin-bottom: 0;
}

.tip-label {
  font-weight: 600;
  color: #303133;
  margin-right: 8px;
}

.tip-text {
  color: #606266;
}
</style>
