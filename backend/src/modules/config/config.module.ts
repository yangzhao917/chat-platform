import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { ConfigController } from './config.controller';
import { AppConfigService } from './config.service';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [NestConfigModule, AiModule],
  controllers: [ConfigController],
  providers: [AppConfigService],
  exports: [AppConfigService],
})
export class ConfigModule {}
