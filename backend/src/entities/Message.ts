import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Account } from './Account';
import { Thread } from './Thread';

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  text: string;

  @CreateDateColumn()
  creationDate: Date;

  @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
  timestamp: Date;

  @ManyToOne(() => Account)
  @JoinColumn({ name: 'authorId' })
  author: Account;

  @ManyToOne(() => Thread, thread => thread.messages)
  @JoinColumn({ name: 'threadId' })
  thread: Thread;
}
