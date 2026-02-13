import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { CharacterModule } from '../character/character.module';
import { MessageModule } from '../message/message.module';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [CharacterModule, MessageModule, AiModule],
  controllers: [ChatController],
})
export class ChatModule {}
