import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CharacterModule } from './modules/character/character.module';
import { MessageModule } from './modules/message/message.module';
import { ChatModule } from './modules/chat/chat.module';
import { AiModule } from './modules/ai/ai.module';
import { UploadModule } from './modules/upload/upload.module';
import { ConfigModule as AppConfigModule } from './modules/config/config.module';
import { ConversationModule } from './modules/conversation/conversation.module';
import { UserProfileModule } from './modules/user-profile/user-profile.module';
import { Character } from './modules/character/character.entity';
import { Message } from './modules/message/message.entity';
import { Conversation } from './modules/conversation/conversation.entity';
import { UserProfile } from './modules/user-profile/user-profile.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get('DB_HOST'),
        port: config.get('DB_PORT'),
        username: config.get('DB_USERNAME'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_DATABASE'),
        entities: [Character, Message, Conversation, UserProfile],
        synchronize: true,
        charset: 'utf8mb4',
      }),
    }),
    CharacterModule,
    MessageModule,
    ChatModule,
    AiModule,
    UploadModule,
    AppConfigModule,
    ConversationModule,
    UserProfileModule,
  ],
})
export class AppModule {}
