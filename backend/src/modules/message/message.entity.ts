import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  BeforeInsert,
  Index,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Entity('messages')
@Index('idx_messages_user_character', ['userId', 'characterId', 'createdAt'])
export class Message {
  @PrimaryColumn('varchar', { length: 36 })
  id: string;

  @Column('varchar', { length: 64, default: 'anonymous' })
  userId: string;

  @Column('varchar', { length: 36 })
  characterId: string;

  @Column('varchar', { length: 20 })
  role: 'user' | 'assistant';

  @Column('text')
  content: string;

  @Column('json', { nullable: true })
  metadata: Record<string, any> | null;

  @CreateDateColumn()
  createdAt: Date;

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = uuidv4();
    }
  }
}
