import FingerprintJS from '@fingerprintjs/fingerprintjs';
const DEVICE_ID_KEY = 'deviceId';
/**
 * 生成设备ID
 * 策略：
 * 1. 优先从LocalStorage读取UUID
 * 2. 如果不存在，生成浏览器指纹作为降级
 * 3. 将设备ID存储到LocalStorage
 */
export async function getDeviceId() {
    // 1. 尝试从LocalStorage读取
    const storedDeviceId = localStorage.getItem(DEVICE_ID_KEY);
    if (storedDeviceId) {
        return storedDeviceId;
    }
    // 2. 生成新的设备ID
    let deviceId;
    try {
        // 尝试生成浏览器指纹
        const fp = await FingerprintJS.load();
        const result = await fp.get();
        deviceId = result.visitorId;
    }
    catch (error) {
        // 如果指纹生成失败，使用随机UUID
        console.warn('Failed to generate fingerprint, using random UUID', error);
        deviceId = generateUUID();
    }
    // 3. 存储到LocalStorage
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
    return deviceId;
}
/**
 * 生成随机UUID（简化版）
 */
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}
/**
 * 清除设备ID（用于测试）
 */
export function clearDeviceId() {
    localStorage.removeItem(DEVICE_ID_KEY);
}
