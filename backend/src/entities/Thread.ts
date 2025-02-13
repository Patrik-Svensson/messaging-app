import { Entity, PrimaryGeneratedColumn, ManyToMany, OneToMany, JoinTable, Column } from 'typeorm';
import { Account } from './Account';
import { Message } from './Message';

@Entity()
export class Thread {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToMany(() => Account)
  @JoinTable()
  participants: Account[];

  @OneToMany(() => Message, message => message.thread)
  messages: Message[];

  @Column()
  title: string;
}
