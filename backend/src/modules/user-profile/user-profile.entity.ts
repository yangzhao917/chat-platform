import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  Index,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Entity('user_profiles')
@Index('idx_user_profiles_user', ['userId'])
export class UserProfile {
  @PrimaryColumn('varchar', { length: 36 })
  id: string;

  @Column('varchar', { length: 64, unique: true })
  userId: string;

  // 关于你
  @Column('varchar', { length: 100, nullable: true })
  name: string | null;

  @Column('varchar', { length: 500, nullable: true })
  avatarUrl: string | null;

  @Column('varchar', { length: 100, nullable: true })
  occupation: string | null;

  @Column('json', { nullable: true })
  hobbies: string[] | null;

  @Column('varchar', { length: 500, nullable: true })
  bio: string | null;

  // 默认回复风格（存储预设模式ID）
  @Column('varchar', { length: 36, nullable: true })
  defaultModeId: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = uuidv4();
    }
  }
}
