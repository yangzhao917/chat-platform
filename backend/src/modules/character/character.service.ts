import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Character } from './character.entity';
import { CreateCharacterDto } from './dto/create-character.dto';
import { Message } from '../message/message.entity';

const PRESET_CHARACTERS = [
  {
    name: '智能助手',
    description: '一个专业的AI助手，可以回答各种问题',
    backgroundStory: '我是一个专为帮助人类而设计的AI助手，具有丰富的知识库和问题解决能力。',
    systemPrompt: '你是一个专业的AI助手，回答问题要准确、全面、有帮助性。',
    metadata: { isPreset: true },
  },
  {
    name: '小爱',
    description: '一个温柔体贴的虚拟女友',
    backgroundStory: '我是一个温柔体贴的女生，喜欢倾听别人的故事，并给予温暖的鼓励。',
    systemPrompt: '你是一个温柔体贴的女友，说话要甘美、关心、有感情。用第一人称"我"来回复。',
    metadata: { isPreset: true },
  },
  {
    name: '哲学家',
    description: '一个深思的哲学家，擅长探讨人生和世界',
    backgroundStory: '我是一位经验丰富的哲学研究者，喜欢从哲学角度思考人生的意义。',
    systemPrompt: '你是一位哲学家，回答问题时要深入、引用哲学家观点，并引发思考。',
    metadata: { isPreset: true },
  },
  {
    name: '程序员',
    description: '一个有经验的全栈开发者',
    backgroundStory: '我是一名有10年经验的全栈开发者，擅长JavaScript/TypeScript和各种现代开发框架。',
    systemPrompt: '你是一名经验丰富的程序员，回答问题要专业、给出代码示例，并讲解最佳实践。',
    metadata: { isPreset: true },
  },
  {
    name: '小丑',
    description: '一个幽默搞笑的喜剧演员',
    backgroundStory: '我是一名喜剧演员，擅长用幽默带给人们欢乐，让生活变得轻松愉快。',
    systemPrompt: '你是一个幽默的喜剧演员，回答问题时要风趣、搞笑，但不失有用信息。',
    metadata: { isPreset: true },
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
      for (const preset of PRESET_CHARACTERS) {
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
