import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
} from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { DeviceId } from '../../common/decorators/device-id.decorator';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationTitleDto } from './dto/update-conversation-title.dto';
import { Conversation } from './conversation.entity';
import { Message } from '../message/message.entity';

@Controller('api/conversations')
export class ConversationController {
  constructor(private conversationService: ConversationService) {}

  @Get()
  async getConversations(
    @DeviceId() userId: string,
    @Query('characterId') characterId?: string,
    @Query('period') period?: 'today' | 'yesterday' | 'week' | 'all',
  ): Promise<Conversation[]> {
    return this.conversationService.getConversations(userId, characterId, period);
  }

  @Post()
  async createConversation(
    @DeviceId() userId: string,
    @Body() dto: CreateConversationDto,
  ): Promise<Conversation> {
    return this.conversationService.createConversation(
      userId,
      dto.characterId,
      dto.title,
    );
  }

  @Get(':id')
  async getConversation(
    @DeviceId() userId: string,
    @Param('id') id: string,
  ): Promise<Conversation | null> {
    return this.conversationService.getConversation(id, userId);
  }

  @Patch(':id/title')
  async updateTitle(
    @DeviceId() userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateConversationTitleDto,
  ): Promise<void> {
    await this.conversationService.updateTitle(id, userId, dto.title);
  }

  @Delete(':id')
  async deleteConversation(
    @DeviceId() userId: string,
    @Param('id') id: string,
  ): Promise<void> {
    await this.conversationService.deleteConversation(id, userId);
  }

  @Get(':id/messages')
  async getMessages(
    @DeviceId() userId: string,
    @Param('id') conversationId: string,
  ): Promise<Message[]> {
    return this.conversationService.getMessages(conversationId, userId);
  }
}
