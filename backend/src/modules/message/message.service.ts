import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './message.entity';

const HISTORY_LIMIT = 20;

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
  ) {}

  async getHistory(
    userId: string,
    characterId: string,
    conversationId: string = 'default',
  ): Promise<Message[]> {
    const messages = await this.messageRepository.find({
      where: { userId, characterId, conversationId },
      order: { createdAt: 'DESC' },
      take: HISTORY_LIMIT,
    });
    return messages.reverse();
  }

  async saveMessage(
    userId: string,
    characterId: string,
    role: 'user' | 'assistant',
    content: string,
    metadata?: Record<string, any> | null,
    conversationId?: string,
  ): Promise<Message> {
    const message = this.messageRepository.create({
      userId,
      characterId,
      role,
      content,
      metadata,
      conversationId: conversationId || 'default',
    });
    return this.messageRepository.save(message);
  }

  async clearHistory(
    userId: string,
    characterId: string,
    conversationId: string = 'default',
  ): Promise<void> {
    await this.messageRepository.delete({ userId, characterId, conversationId });
  }
}
