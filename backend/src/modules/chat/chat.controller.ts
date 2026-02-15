import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Query,
  Res,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { CharacterService } from '../character/character.service';
import { MessageService } from '../message/message.service';
import { AiService, ChatMessage } from '../ai/ai.service';
import { UserProfileService } from '../user-profile/user-profile.service';
import { ConversationService } from '../conversation/conversation.service';
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
    private readonly userProfileService: UserProfileService,
    private readonly conversationService: ConversationService,
  ) {}

  @Post('stream')
  async stream(
    @DeviceId() userId: string,
    @Body() sendMessageDto: SendMessageDto,
    @Res() res: Response,
  ) {
    const { characterId, content, conversationId, imageUrl, model = 'gpt-4o' } = sendMessageDto;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
      // 查找或创建对话
      const conversation = await this.conversationService.findOrCreateConversation(
        userId,
        characterId,
        conversationId,
        content,
      );
      const actualConversationId = conversation.id;

      // 并行执行角色查询、历史查询和用户配置查询
      const [character, history, userProfile] = await Promise.all([
        this.characterService.findOne(characterId),
        this.messageService.getHistory(userId, characterId, actualConversationId),
        this.userProfileService.getProfile(userId),
      ]);

      // 构建增强的 systemPrompt
      let enhancedSystemPrompt = character.systemPrompt;

      // 追加用户信息
      if (userProfile.name || userProfile.occupation || userProfile.hobbies || userProfile.bio) {
        let userInfo = '\n\n关于用户的信息：\n';
        if (userProfile.name) userInfo += `- 姓名：${userProfile.name}\n`;
        if (userProfile.occupation) userInfo += `- 职业：${userProfile.occupation}\n`;
        if (userProfile.hobbies && userProfile.hobbies.length > 0) {
          userInfo += `- 爱好：${userProfile.hobbies.join('、')}\n`;
        }
        if (userProfile.bio) userInfo += `- 简介：${userProfile.bio}\n`;
        enhancedSystemPrompt += userInfo;
        enhancedSystemPrompt += '\n请根据用户信息调整你的回复风格。用户也可能在对话中要求你调整回复方式，请灵活适应。';
      }

      // 异步保存用户消息，不阻塞AI响应
      const metadata = imageUrl ? { imageUrl } : null;
      this.messageService
        .saveMessage(userId, characterId, 'user', content, metadata, actualConversationId)
        .catch((err) =>
          this.logger.error('Failed to save user message:', err),
        );

      // 构建消息数组，支持图片
      const messages: ChatMessage[] = [
        { role: 'system', content: enhancedSystemPrompt },
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

      res.write(`event: start\ndata: ${JSON.stringify({
        messageId,
        conversation: {
          id: conversation.id,
          title: conversation.title,
          characterId: conversation.characterId,
          createdAt: conversation.createdAt,
          updatedAt: conversation.updatedAt,
        }
      })}\n\n`);

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
        .saveMessage(userId, characterId, 'assistant', assistantMessage, null, actualConversationId)
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
    @Query('conversationId') conversationId?: string,
  ): Promise<Message[]> {
    return this.messageService.getHistory(userId, characterId, conversationId || 'default');
  }

  @Delete('history/:characterId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async clearHistory(
    @DeviceId() userId: string,
    @Param('characterId') characterId: string,
    @Query('conversationId') conversationId?: string,
  ): Promise<void> {
    return this.messageService.clearHistory(userId, characterId, conversationId || 'default');
  }
}
