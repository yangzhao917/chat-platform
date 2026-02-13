import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

/**
 * 设备ID装饰器
 * 从请求头 X-Device-Id 提取设备ID
 * 如果不存在，返回默认值 'anonymous'（向后兼容）
 */
export const DeviceId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const deviceId = request.headers['x-device-id'] as string;
    return deviceId || 'anonymous';
  },
);
