import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { UserProfile } from '@/types';
import { userProfileApi } from '@/api';

export const useUserProfileStore = defineStore('userProfile', () => {
  const profile = ref<UserProfile | null>(null);
  const loading = ref(false);

  const fetchProfile = async () => {
    loading.value = true;
    try {
      const response = await userProfileApi.get();
      profile.value = response.data;
    } finally {
      loading.value = false;
    }
  };

  const upsertProfile = async (data: Partial<UserProfile>) => {
    loading.value = true;
    try {
      const response = await userProfileApi.upsert(data);
      profile.value = response.data;
    } finally {
      loading.value = false;
    }
  };

  const uploadAvatar = async (file: File) => {
    loading.value = true;
    try {
      await userProfileApi.uploadAvatar(file);
      await fetchProfile();
    } finally {
      loading.value = false;
    }
  };

  return {
    profile,
    loading,
    fetchProfile,
    upsertProfile,
    uploadAvatar,
  };
});
