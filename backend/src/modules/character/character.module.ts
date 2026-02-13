import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Character } from './character.entity';
import { Message } from '../message/message.entity';
import { CharacterService } from './character.service';
import { CharacterController } from './character.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Character, Message])],
  controllers: [CharacterController],
  providers: [CharacterService],
  exports: [CharacterService],
})
export class CharacterModule {}
