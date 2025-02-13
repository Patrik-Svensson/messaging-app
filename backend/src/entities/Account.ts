import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Thread } from './Thread';

@Entity()
export class Account {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @OneToMany(() => Thread, thread => thread.participants)
  threads: Thread[];
}
