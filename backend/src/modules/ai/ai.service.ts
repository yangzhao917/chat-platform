import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { promises as fs } from 'fs';
import * as path from 'path';

export type ChatMessage = ChatCompletionMessageParam;

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly openai: OpenAI;
  private readonly currentProvider: 'openai' | 'deepseek' | 'stepfun';

  // 图片Base64缓存
  private imageCache = new Map<string, { base64: string; timestamp: number }>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5分钟过期

  constructor(private configService: ConfigService) {
    const stepfunKey = this.configService.get<string>('STEPFUN_API_KEY');
    const deepseekKey = this.configService.get<string>('DEEPSEEK_API_KEY');
    const openaiKey = this.configService.get<string>('OPENAI_API_KEY');

    // 优先级：StepFun > DeepSeek > OpenAI
    // 优先使用StepFun（用户有免费额度）
    if (stepfunKey && stepfunKey !== 'your_stepfun_api_key_here') {
      this.openai = new OpenAI({
        apiKey: stepfunKey,
        baseURL: 'https://api.stepfun.com/v1',
        timeout: 60000, // 60秒超时
      });
      this.currentProvider = 'stepfun';
      this.logger.log('StepFun API client initialized');
    } else if (deepseekKey && deepseekKey !== 'sk-e9bbd9f7bcd44caeb13eed77186ca5cc') {
      this.openai = new OpenAI({
        apiKey: deepseekKey,
        baseURL: 'https://api.deepseek.com',
        timeout: 60000, // 60秒超时
      });
      this.currentProvider = 'deepseek';
      this.logger.log('DeepSeek API client initialized');
    } else if (openaiKey && openaiKey !== 'your_openai_api_key_here') {
      this.openai = new OpenAI({
        apiKey: openaiKey,
        baseURL: 'https://api.openai.com/v1',
        timeout: 60000, // 60秒超时
      });
      this.currentProvider = 'openai';
      this.logger.log('OpenAI API client initialized');
    } else {
      throw new Error('No AI API key configured (STEPFUN_API_KEY, DEEPSEEK_API_KEY, or OPENAI_API_KEY)');
    }
  }

  /**
   * 获取当前使用的 API 提供商
   */
  getCurrentProvider(): 'openai' | 'deepseek' | 'stepfun' {
    return this.currentProvider;
  }

  /**
   * 将本地图片 URL 转换为 Base64 格式
   * 如果是公网 URL，直接返回
   */
  private async convertImageUrlToBase64(url: string): Promise<string> {
    // 检测是否是本地 URL
    if (!url.includes('localhost') && !url.includes('127.0.0.1')) {
      return url;
    }

    // 检查缓存
    const cached = this.imageCache.get(url);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      this.logger.log(`Using cached image: ${url}`);
      return cached.base64;
    }

    try {
      // 提取文件路径：/uploads/xxx.jpg
      const urlObj = new URL(url);
      const filePath = urlObj.pathname;

      // 构建实际文件路径：./uploads/xxx.jpg
      const actualPath = path.join(process.cwd(), filePath);

      this.logger.log(`Converting local image to Base64: ${actualPath}`);

      // 读取文件
      const fileBuffer = await fs.readFile(actualPath);

      // 获取文件扩展名，确定 MIME 类型
      const ext = path.extname(filePath).toLowerCase().substring(1);
      const mimeTypes: Record<string, string> = {
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        png: 'image/png',
        gif: 'image/gif',
        webp: 'image/webp',
      };
      const mimeType = mimeTypes[ext] || 'image/jpeg';

      // 转换为 Base64
      const base64 = fileBuffer.toString('base64');
      const dataUrl = `data:${mimeType};base64,${base64}`;

      this.logger.log(`Image converted to Base64 (${ext}, ${fileBuffer.length} bytes)`);

      // 存入缓存
      this.imageCache.set(url, { base64: dataUrl, timestamp: Date.now() });

      return dataUrl;
    } catch (error) {
      this.logger.error(`Failed to convert image to Base64: ${error.message}`);
      throw new Error(`图片读取失败: ${error.message}`);
    }
  }

  /**
   * 处理消息数组，将本地图片 URL 转换为 Base64
   */
  private async processMessages(messages: ChatMessage[]): Promise<ChatMessage[]> {
    const processedMessages: ChatMessage[] = [];

    for (const message of messages) {
      // 如果消息内容是数组（多模态格式）
      if (Array.isArray(message.content)) {
        // 收集所有图片处理任务
        const imagePromises: Promise<string>[] = [];
        const imageIndices: number[] = [];

        message.content.forEach((item: any, index) => {
          if (item.type === 'image_url' && item.image_url?.url) {
            imageIndices.push(index);
            imagePromises.push(this.convertImageUrlToBase64(item.image_url.url));
          }
        });

        // 并行处理所有图片
        const convertedUrls = await Promise.all(imagePromises);

        // 构建处理后的内容
        const processedContent = message.content.map((item, index) => {
          const imageIndex = imageIndices.indexOf(index);
          if (imageIndex !== -1) {
            return {
              type: 'image_url',
              image_url: { url: convertedUrls[imageIndex] },
            };
          }
          return item;
        });

        processedMessages.push({
          ...message,
          content: processedContent as any,
        });
      } else {
        // 文本消息，直接添加
        processedMessages.push(message);
      }
    }

    return processedMessages;
  }

  async *streamChat(
    messages: ChatMessage[],
    model: 'gpt-4-vision-preview' | 'gpt-4o' | 'deepseek-chat' | 'deepseek-reasoner' | 'step-3' | 'step-r1-v-mini' | 'step-3.5-flash' = 'gpt-4o'
  ): AsyncGenerator<string> {
    try {
      this.logger.log(`Starting stream chat with model: ${model}`);

      // 处理消息中的图片 URL，将本地 URL 转换为 Base64
      const processedMessages = await this.processMessages(messages);

      const stream = await this.openai.chat.completions.create({
        model,
        messages: processedMessages,
        stream: true,
        // 阶跃星辰推理模型不建议设置max_tokens
        ...(model.startsWith('step-') && (model === 'step-3' || model === 'step-r1-v-mini')
          ? {}
          : { max_tokens: 4096 }
        ),
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          yield content;
        }
      }

      this.logger.log('Stream chat completed successfully');
    } catch (error) {
      this.logger.error('Error in stream chat:', error);

      // 记录详细的错误信息
      if (error.response?.data) {
        this.logger.error('API Error Response:', JSON.stringify(error.response.data));
      }

      if (error.status === 401) {
        throw new Error('API密钥无效，请检查配置');
      } else if (error.status === 400) {
        // 400 错误可能是图片相关问题
        const errorMsg = error.response?.data?.error?.message || error.message;
        this.logger.error('Bad Request (可能是图片问题):', errorMsg);
        throw new Error(`请求参数错误: ${errorMsg}`);
      } else if (error.status === 429) {
        throw new Error('API请求频率超限，请稍后重试');
      } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        throw new Error('无法连接到API服务，请检查网络连接');
      } else if (error.code === 'ETIMEDOUT' || error.message?.includes('timeout')) {
        throw new Error('API请求超时，请稍后重试');
      } else {
        throw new Error(`API调用失败: ${error.message || '未知错误'}`);
      }
    }
  }
}
