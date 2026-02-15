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

@Entity('conversations')
@Index('idx_conversations_user_character', ['userId', 'characterId', 'createdAt'])
@Index('idx_conversations_user_updated', ['userId', 'updatedAt'])
export class Conversation {
  @PrimaryColumn('varchar', { length: 36 })
  id: string;

  @Column('varchar', { length: 64 })
  userId: string;

  @Column('varchar', { length: 36 })
  characterId: string;

  @Column('varchar', { length: 200 })
  title: string;

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
