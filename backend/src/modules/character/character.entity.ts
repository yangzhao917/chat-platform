import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Entity('characters')
export class Character {
  @PrimaryColumn('varchar', { length: 36 })
  id: string;

  @Column('varchar', { length: 100 })
  name: string;

  @Column('varchar', { length: 500, nullable: true })
  avatarUrl: string | null;

  @Column('varchar', { length: 500 })
  description: string;

  @Column('text')
  backgroundStory: string;

  @Column('text')
  systemPrompt: string;

  @Column('json', { nullable: true })
  metadata: Record<string, any> | null;

  @Column('tinyint', { width: 1, default: 1 })
  isActive: number;

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
