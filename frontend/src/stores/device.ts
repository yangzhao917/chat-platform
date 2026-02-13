import { defineStore } from 'pinia';
import { ref } from 'vue';
import { getDeviceId } from '../utils/device-id';

export const useDeviceStore = defineStore('device', () => {
  const deviceId = ref<string>('');
  const isInitialized = ref(false);

  /**
   * 初始化设备ID
   */
  async function initialize() {
    if (isInitialized.value) {
      return;
    }

    try {
      deviceId.value = await getDeviceId();
      isInitialized.value = true;
      console.log('Device ID initialized:', deviceId.value);
    } catch (error) {
      console.error('Failed to initialize device ID:', error);
      throw error;
    }
  }

  return {
    deviceId,
    isInitialized,
    initialize,
  };
});
