import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

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
  constructor(private readonly configService: ConfigService) {}

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
    const result: ProviderModels[] = [];

    // 检查OpenAI API密钥
    const openaiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (openaiKey && openaiKey !== 'your_openai_api_key_here') {
      result.push({
        provider: 'openai',
        models: this.modelMapping.openai,
      });
    }

    // 检查DeepSeek API密钥
    const deepseekKey = this.configService.get<string>('DEEPSEEK_API_KEY');
    if (deepseekKey && deepseekKey !== 'your_deepseek_api_key_here') {
      result.push({
        provider: 'deepseek',
        models: this.modelMapping.deepseek,
      });
    }

    // 检查StepFun API密钥
    const stepfunKey = this.configService.get<string>('STEPFUN_API_KEY');
    if (stepfunKey && stepfunKey !== 'your_stepfun_api_key_here') {
      result.push({
        provider: 'stepfun',
        models: this.modelMapping.stepfun,
      });
    }

    return result;
  }
}
