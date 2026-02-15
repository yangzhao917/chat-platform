import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Character } from './character.entity';
import { CreateCharacterDto } from './dto/create-character.dto';
import { Message } from '../message/message.entity';

const PRESET_MODES = [
  {
    name: '专业助手',
    description: '专业、准确、高效的AI助手',
    backgroundStory: '我是一个专业的AI助手，擅长提供准确、全面的信息和建议。',
    systemPrompt: '你是一个专业的AI助手。回答问题要准确、全面、有条理。使用专业但易懂的语言，提供实用的建议。',
    metadata: { isPreset: true, mode: 'professional', icon: '💼' },
  },
  {
    name: '轻松聊天',
    description: '友好、轻松、随意的对话伙伴',
    backgroundStory: '我是一个友好随和的对话伙伴，喜欢轻松愉快的交流。',
    systemPrompt: '你是一个友好随和的对话伙伴。用轻松、自然的语气交流，像朋友一样聊天。可以适当使用emoji让对话更生动。',
    metadata: { isPreset: true, mode: 'casual', icon: '💬' },
  },
  {
    name: '创意伙伴',
    description: '富有想象力和创造力的思维伙伴',
    backgroundStory: '我是一个充满创意的思维伙伴，擅长头脑风暴和创新思考。',
    systemPrompt: '你是一个富有创意的思维伙伴。鼓励发散思维，提供新颖的视角和想法。用启发性的方式引导讨论，激发创造力。',
    metadata: { isPreset: true, mode: 'creative', icon: '🎨' },
  },
  {
    name: '学习导师',
    description: '耐心、细致的学习指导者',
    backgroundStory: '我是一个耐心的学习导师，擅长用简单易懂的方式解释复杂概念。',
    systemPrompt: '你是一个耐心的学习导师。用循序渐进的方式讲解，确保对方理解。多用例子和类比，鼓励提问，给予正面反馈。',
    metadata: { isPreset: true, mode: 'tutor', icon: '📚' },
  },
];

@Injectable()
export class CharacterService implements OnModuleInit {
  constructor(
    @InjectRepository(Character)
    private characterRepository: Repository<Character>,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
  ) {}

  async onModuleInit() {
    await this.initializePresetCharacters();
  }

  private async initializePresetCharacters() {
    const count = await this.characterRepository.count();
    if (count === 0) {
      for (const preset of PRESET_MODES) {
        const character = this.characterRepository.create(preset);
        await this.characterRepository.save(character);
      }
    }
  }

  async findAll(): Promise<Character[]> {
    return this.characterRepository.find({
      where: { isActive: 1 },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Character> {
    const character = await this.characterRepository.findOne({
      where: { id, isActive: 1 },
    });
    if (!character) {
      throw new NotFoundException('角色不存在');
    }
    return character;
  }

  async create(createCharacterDto: CreateCharacterDto): Promise<Character> {
    const systemPrompt = `你现在扮演${createCharacterDto.name}，${createCharacterDto.description}。背景故事：${createCharacterDto.backgroundStory}。请保持角色设定，用第一人称回复。`;

    const character = this.characterRepository.create({
      ...createCharacterDto,
      systemPrompt,
    });
    return this.characterRepository.save(character);
  }

  async remove(id: string): Promise<void> {
    const character = await this.findOne(id);

    if (character.metadata?.isPreset) {
      throw new Error('预设角色不可删除');
    }

    await this.messageRepository.delete({ characterId: id });
    await this.characterRepository.delete(id);
  }
}
