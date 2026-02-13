import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Res,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { CharacterService } from '../character/character.service';
import { MessageService } from '../message/message.service';
import { AiService, ChatMessage } from '../ai/ai.service';
import { SendMessageDto } from './dto/send-message.dto';
import { Message } from '../message/message.entity';
import { DeviceId } from '../../common/decorators/device-id.decorator';

@Controller('api/chat')
export class ChatController {
  private readonly logger = new Logger(ChatController.name);

  constructor(
    private readonly characterService: CharacterService,
    private readonly messageService: MessageService,
    private readonly aiService: AiService,
  ) {}

  @Post('stream')
  async stream(
    @DeviceId() userId: string,
    @Body() sendMessageDto: SendMessageDto,
    @Res() res: Response,
  ) {
    const { characterId, content, imageUrl, model = 'gpt-4o' } = sendMessageDto;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
      // 并行执行角色查询和历史查询
      const [character, history] = await Promise.all([
        this.characterService.findOne(characterId),
        this.messageService.getHistory(userId, characterId),
      ]);

      // 异步保存用户消息，不阻塞AI响应
      const metadata = imageUrl ? { imageUrl } : null;
      this.messageService
        .saveMessage(userId, characterId, 'user', content, metadata)
        .catch((err) =>
          this.logger.error('Failed to save user message:', err),
        );

      // 构建消息数组，支持图片
      const messages: ChatMessage[] = [
        { role: 'system', content: character.systemPrompt },
        ...history.map((msg): ChatMessage => {
          // 如果消息包含图片，使用多模态格式
          if (msg.metadata?.imageUrl && msg.role === 'user') {
            return {
              role: 'user',
              content: [
                { type: 'text', text: msg.content },
                { type: 'image_url', image_url: { url: msg.metadata.imageUrl } },
              ],
            };
          }
          return {
            role: msg.role,
            content: msg.content,
          } as ChatMessage;
        }),
      ];

      // 添加当前消息
      if (imageUrl) {
        messages.push({
          role: 'user',
          content: [
            { type: 'text', text: content },
            { type: 'image_url', image_url: { url: imageUrl } },
          ],
        });
      } else {
        messages.push({ role: 'user', content });
      }

      let assistantMessage = '';
      const messageId = '';

      res.write(`event: start\ndata: ${JSON.stringify({ messageId })}\n\n`);

      for await (const chunk of this.aiService.streamChat(messages, model)) {
        assistantMessage += chunk;
        res.write(`event: token\ndata: ${JSON.stringify({ content: chunk })}\n\n`);
      }

      // 立即发送完成事件
      res.write(
        `event: complete\ndata: ${JSON.stringify({ success: true })}\n\n`,
      );

      // 异步保存AI响应消息，不阻塞响应
      this.messageService
        .saveMessage(userId, characterId, 'assistant', assistantMessage)
        .catch((err) =>
          this.logger.error('Failed to save AI message:', err),
        );
    } catch (error) {
      this.logger.error('Error in stream chat:', error);
      this.logger.error('Error details:', {
        characterId,
        hasImage: !!imageUrl,
        model,
        errorMessage: error.message,
      });

      res.write(
        `event: error\ndata: ${JSON.stringify({ error: error.message })}\n\n`,
      );
    } finally {
      res.end();
    }
  }

  @Get('history/:characterId')
  async getHistory(
    @DeviceId() userId: string,
    @Param('characterId') characterId: string,
  ): Promise<Message[]> {
    return this.messageService.getHistory(userId, characterId);
  }

  @Delete('history/:characterId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async clearHistory(
    @DeviceId() userId: string,
    @Param('characterId') characterId: string,
  ): Promise<void> {
    return this.messageService.clearHistory(userId, characterId);
  }
}
