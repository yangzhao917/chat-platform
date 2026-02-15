import {
  Controller,
  Get,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserProfileService } from './user-profile.service';
import { DeviceId } from '../../common/decorators/device-id.decorator';
import { UpsertUserProfileDto } from './dto/upsert-user-profile.dto';
import { UserProfile } from './user-profile.entity';

@Controller('api/user-profile')
export class UserProfileController {
  constructor(private userProfileService: UserProfileService) {}

  @Get()
  async getProfile(@DeviceId() userId: string): Promise<UserProfile> {
    return this.userProfileService.getProfile(userId);
  }

  @Post()
  async upsertProfile(
    @DeviceId() userId: string,
    @Body() dto: UpsertUserProfileDto,
  ): Promise<UserProfile> {
    return this.userProfileService.upsertProfile(userId, dto);
  }

  @Post('avatar')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(
    @DeviceId() userId: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ avatarUrl: string }> {
    const avatarUrl = await this.userProfileService.uploadAvatar(userId, file);
    return { avatarUrl };
  }
}
