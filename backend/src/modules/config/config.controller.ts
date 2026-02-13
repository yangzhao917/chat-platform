import { Controller, Get } from '@nestjs/common';
import { AppConfigService } from './config.service';
import type { ModelInfo } from './config.service';

@Controller('api/config')
export class ConfigController {
  constructor(private readonly configService: AppConfigService) {}

  @Get('available-models')
  getAvailableModels(): { success: boolean; data: ModelInfo[] } {
    const providers = this.configService.getAvailableModels();

    // 将所有提供商的模型合并到一个数组
    const allModels = providers.flatMap(p => p.models);

    return {
      success: true,
      data: allModels,
    };
  }
}
