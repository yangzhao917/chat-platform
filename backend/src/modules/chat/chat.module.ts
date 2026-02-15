import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { CharacterModule } from '../character/character.module';
import { MessageModule } from '../message/message.module';
import { AiModule } from '../ai/ai.module';
import { UserProfileModule } from '../user-profile/user-profile.module';
import { ConversationModule } from '../conversation/conversation.module';

@Module({
  imports: [CharacterModule, MessageModule, AiModule, UserProfileModule, ConversationModule],
  controllers: [ChatController],
})
export class ChatModule {}
