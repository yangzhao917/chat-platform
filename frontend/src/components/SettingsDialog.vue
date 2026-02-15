<template>
  <el-dialog
    v-model="visible"
    title="设置"
    width="800px"
    :close-on-click-modal="false"
  >
    <el-container style="height: 500px">
      <!-- 左侧菜单 -->
      <el-aside width="180px" class="settings-sidebar">
        <el-menu :default-active="activeMenu" @select="handleMenuSelect">
          <el-menu-item index="about-you">
            <el-icon><User /></el-icon>
            <span>关于我</span>
          </el-menu-item>
          <el-menu-item index="personal-config">
            <el-icon><Setting /></el-icon>
            <span>个性化配置</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <!-- 右侧内容区域 -->
      <el-main class="settings-content">
        <AboutYouPanel v-if="activeMenu === 'about-you'" @success="handleSaveSuccess" />
        <PersonalConfigPanel
          v-if="activeMenu === 'personal-config'"
          @success="handleSaveSuccess"
        />
      </el-main>
    </el-container>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { User, Setting } from '@element-plus/icons-vue';
import AboutYouPanel from './AboutYouPanel.vue';
import PersonalConfigPanel from './PersonalConfigPanel.vue';

const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>();

const activeMenu = ref('about-you');

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const handleMenuSelect = (index: string) => {
  activeMenu.value = index;
};

const handleSaveSuccess = () => {
  ElMessage.success('保存成功');
};
</script>

<style scoped>
.settings-sidebar {
  background-color: #f5f7fa;
  border-right: 1px solid #e4e7ed;
}

.settings-content {
  padding: 24px;
  overflow-y: auto;
}
</style>
