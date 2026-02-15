import { IsString, MaxLength } from 'class-validator';

export class UpdateConversationTitleDto {
  @IsString()
  @MaxLength(200)
  title: string;
}
