import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserProfile } from './user-profile.entity';
import { UpsertUserProfileDto } from './dto/upsert-user-profile.dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UserProfileService {
  constructor(
    @InjectRepository(UserProfile)
    private userProfileRepository: Repository<UserProfile>,
  ) {}

  // 获取用户信息（不存在则返回默认配置）
  async getProfile(userId: string): Promise<UserProfile> {
    let profile = await this.userProfileRepository.findOne({
      where: { userId },
    });

    if (!profile) {
      // 返回空的 profile 对象（使用默认值）
      profile = this.userProfileRepository.create({
        userId,
      });
    }

    return profile;
  }

  // 创建或更新用户信息
  async upsertProfile(
    userId: string,
    dto: UpsertUserProfileDto,
  ): Promise<UserProfile> {
    let profile = await this.userProfileRepository.findOne({
      where: { userId },
    });

    if (!profile) {
      profile = this.userProfileRepository.create({
        userId,
      });
    }

    // 合并更新
    if (dto.name !== undefined) profile.name = dto.name;
    if (dto.avatarUrl !== undefined) profile.avatarUrl = dto.avatarUrl;
    if (dto.occupation !== undefined) profile.occupation = dto.occupation;
    if (dto.hobbies !== undefined) profile.hobbies = dto.hobbies;
    if (dto.bio !== undefined) profile.bio = dto.bio;
    if (dto.defaultModeId !== undefined) profile.defaultModeId = dto.defaultModeId;

    return this.userProfileRepository.save(profile);
  }

  // 上传头像
  async uploadAvatar(
    userId: string,
    file: Express.Multer.File,
  ): Promise<string> {
    // 1. 保存文件到本地
    const fileName = `${userId}-${Date.now()}${path.extname(file.originalname)}`;
    const uploadsDir = path.join(process.cwd(), 'uploads', 'avatars');
    const storagePath = path.join(uploadsDir, fileName);
    const url = `/uploads/avatars/${fileName}`;

    // 确保目录存在
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // 保存文件
    fs.writeFileSync(storagePath, file.buffer);

    // 2. 更新数据库
    let profile = await this.userProfileRepository.findOne({
      where: { userId },
    });

    if (!profile) {
      profile = this.userProfileRepository.create({
        userId,
        avatarUrl: url,
      });
    } else {
      profile.avatarUrl = url;
    }

    await this.userProfileRepository.save(profile);

    return url;
  }
}
