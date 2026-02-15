import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Conversation } from './conversation.entity';
import { Message } from '../message/message.entity';

@Injectable()
export class ConversationService {
  constructor(
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
  ) {}

  // 获取对话列表
  async getConversations(
    userId: string,
    characterId?: string,
    period?: 'today' | 'yesterday' | 'week' | 'all',
  ): Promise<Conversation[]> {
    const where: any = { userId };
    if (characterId) {
      where.characterId = characterId;
    }

    // 根据时间过滤
    if (period && period !== 'all') {
      const now = new Date();
      if (period === 'today') {
        const startOfDay = new Date(now.setHours(0, 0, 0, 0));
        const endOfDay = new Date(now.setHours(23, 59, 59, 999));
        where.createdAt = Between(startOfDay, endOfDay);
      } else if (period === 'yesterday') {
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const startOfDay = new Date(yesterday.setHours(0, 0, 0, 0));
        const endOfDay = new Date(yesterday.setHours(23, 59, 59, 999));
        where.createdAt = Between(startOfDay, endOfDay);
      } else if (period === 'week') {
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        where.createdAt = Between(weekAgo, new Date());
      }
    }

    return this.conversationRepository.find({
      where,
      order: { updatedAt: 'DESC' },
    });
  }

  // 创建新对话
  async createConversation(
    userId: string,
    characterId: string,
    title?: string,
  ): Promise<Conversation> {
    const conversation = this.conversationRepository.create({
      userId,
      characterId,
      title: title || '新对话',
    });
    return this.conversationRepository.save(conversation);
  }

  // 获取对话详情
  async getConversation(id: string, userId: string): Promise<Conversation | null> {
    return this.conversationRepository.findOne({
      where: { id, userId },
    });
  }

  // 更新对话标题
  async updateTitle(id: string, userId: string, title: string): Promise<void> {
    await this.conversationRepository.update({ id, userId }, { title });
  }

  // 删除对话（级联删除消息）
  async deleteConversation(id: string, userId: string): Promise<void> {
    await this.messageRepository.delete({ conversationId: id, userId });
    await this.conversationRepository.delete({ id, userId });
  }

  // 获取对话消息列表
  async getMessages(id: string, userId: string): Promise<Message[]> {
    return this.messageRepository.find({
      where: { conversationId: id, userId },
      order: { createdAt: 'ASC' },
      take: 20,
    });
  }

  // 生成对话标题（截取前20字）
  generateTitle(content: string): string {
    const maxLength = 20;
    const cleaned = content.trim().replace(/\s+/g, ' ');
    return cleaned.length > maxLength
      ? cleaned.substring(0, maxLength) + '...'
      : cleaned;
  }

  // 查找或创建对话
  async findOrCreateConversation(
    userId: string,
    characterId: string,
    conversationId: string | undefined,
    firstMessageContent: string,
  ): Promise<Conversation> {
    // 如果提供了有效的conversationId，验证并返回
    if (conversationId && conversationId !== 'default') {
      const exists = await this.conversationRepository.findOne({
        where: { id: conversationId, userId },
      });
      if (exists) return exists;
    }

    // 创建新对话
    const title = this.generateTitle(firstMessageContent);
    const conversation = await this.createConversation(userId, characterId, title);
    return conversation;
  }
}
