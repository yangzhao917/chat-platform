import { IsString, IsNotEmpty, MaxLength, IsUUID, IsOptional, IsIn, IsUrl } from 'class-validator';

export class SendMessageDto {
  @IsUUID()
  characterId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  content: string;

  @IsOptional()
  @IsString()
  conversationId?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsIn(['gpt-4-vision-preview', 'gpt-4o', 'deepseek-chat', 'deepseek-reasoner', 'step-3', 'step-r1-v-mini', 'step-3.5-flash'])
  model?: 'gpt-4-vision-preview' | 'gpt-4o' | 'deepseek-chat' | 'deepseek-reasoner' | 'step-3' | 'step-r1-v-mini' | 'step-3.5-flash';
}
