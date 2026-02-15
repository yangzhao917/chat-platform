<template>
  <el-form :model="form" label-width="100px">
    <!-- 头像 -->
    <el-form-item label="头像">
      <el-upload
        :auto-upload="false"
        :show-file-list="false"
        accept="image/*"
        :on-change="handleAvatarChange"
      >
        <el-avatar :size="80" :src="avatarPreview" shape="circle">
          <el-icon><Plus /></el-icon>
        </el-avatar>
      </el-upload>
      <div class="form-hint">点击上传头像，支持 JPG、PNG 格式，大小不超过 5MB</div>
    </el-form-item>

    <!-- 昵称 -->
    <el-form-item label="昵称">
      <el-input
        v-model="form.name"
        placeholder="请输入昵称"
        maxlength="100"
        show-word-limit
      />
    </el-form-item>

    <!-- 职业 -->
    <el-form-item label="职业">
      <el-input v-model="form.occupation" placeholder="请输入职业" maxlength="100" />
    </el-form-item>

    <!-- 爱好 -->
    <el-form-item label="爱好">
      <el-select
        v-model="form.hobbies"
        multiple
        filterable
        allow-create
        placeholder="选择或输入爱好"
        style="width: 100%"
      >
        <el-option
          v-for="hobby in commonHobbies"
          :key="hobby"
          :label="hobby"
          :value="hobby"
        />
      </el-select>
    </el-form-item>

    <!-- 个人简介 -->
    <el-form-item label="个人简介">
      <el-input
        v-model="form.bio"
        type="textarea"
        :rows="4"
        placeholder="简单介绍一下自己..."
        maxlength="500"
        show-word-limit
      />
    </el-form-item>

    <!-- 保存按钮 -->
    <el-form-item>
      <el-button type="primary" @click="saveProfile" :loading="saving">
        保存
      </el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import { useUserProfileStore } from '@/stores/userProfile';

const emit = defineEmits<{ success: [] }>();

const userProfileStore = useUserProfileStore();

const form = ref({
  name: '',
  occupation: '',
  hobbies: [] as string[],
  bio: '',
  avatarUrl: '',
});

const avatarFile = ref<File | null>(null);
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

const handleAvatarChange = async (uploadFile: any) => {
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
  if (!avatarFile.value) return;

  saving.value = true;
  try {
    await userProfileStore.uploadAvatar(avatarFile.value);
    await userProfileStore.fetchProfile();
    avatarFile.value = null; // 清空本地文件，使用服务器URL
    ElMessage.success('头像上传成功');
  } catch (error) {
    ElMessage.error('头像上传失败');
  } finally {
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
  } catch (error) {
    ElMessage.error('保存失败');
  } finally {
    saving.value = false;
  }
};
</script>

<style scoped>
.form-hint {
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
}
</style>
