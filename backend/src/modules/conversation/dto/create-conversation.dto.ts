import { IsString, IsOptional, MaxLength } from 'class-validator';

export class CreateConversationDto {
  @IsString()
  characterId: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;
}
