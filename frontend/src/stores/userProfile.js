import { defineStore } from 'pinia';
import { ref } from 'vue';
import { userProfileApi } from '@/api';
export const useUserProfileStore = defineStore('userProfile', () => {
    const profile = ref(null);
    const loading = ref(false);
    const fetchProfile = async () => {
        loading.value = true;
        try {
            const response = await userProfileApi.get();
            profile.value = response.data;
        }
        finally {
            loading.value = false;
        }
    };
    const upsertProfile = async (data) => {
        loading.value = true;
        try {
            const response = await userProfileApi.upsert(data);
            profile.value = response.data;
        }
        finally {
            loading.value = false;
        }
    };
    const uploadAvatar = async (file) => {
        loading.value = true;
        try {
            await userProfileApi.uploadAvatar(file);
            await fetchProfile();
        }
        finally {
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
