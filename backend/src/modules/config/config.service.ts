import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiService } from '../ai/ai.service';

export interface ModelInfo {
  value: string;
  label: string;
  icon: 'lightning' | 'magic-stick';
}

interface ProviderModels {
  provider: 'openai' | 'deepseek' | 'stepfun';
  models: ModelInfo[];
}

@Injectable()
export class AppConfigService {
  constructor(
    private readonly configService: ConfigService,
    private readonly aiService: AiService,
  ) {}

  private readonly modelMapping = {
    openai: [
      { value: 'gpt-4o', label: 'GPT-4o', icon: 'lightning' as const },
      { value: 'gpt-4-vision-preview', label: 'GPT-4 Vision', icon: 'magic-stick' as const },
    ],
    deepseek: [
      { value: 'deepseek-chat', label: 'DeepSeek Chat', icon: 'lightning' as const },
      { value: 'deepseek-reasoner', label: 'DeepSeek R1', icon: 'magic-stick' as const },
    ],
    stepfun: [
      { value: 'step-3', label: 'Step-3', icon: 'lightning' as const },
      { value: 'step-r1-v-mini', label: 'Step-R1-V-Mini', icon: 'magic-stick' as const },
      { value: 'step-3.5-flash', label: 'Step-3.5-Flash', icon: 'lightning' as const },
    ],
  };

  getAvailableModels(): ProviderModels[] {
    // 获取当前实际使用的 API 提供商
    const currentProvider = this.aiService.getCurrentProvider();

    // 只返回当前提供商的模型
    return [
      {
        provider: currentProvider,
        models: this.modelMapping[currentProvider],
      },
    ];
  }
}
