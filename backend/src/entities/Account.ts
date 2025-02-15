import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Thread } from './Thread';

@Entity()
export class Account {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @ManyToMany(() => Thread, thread => thread.participants)
  threads: Thread[];
}
