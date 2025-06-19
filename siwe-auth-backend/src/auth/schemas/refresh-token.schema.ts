import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.schema';

@Entity()
export class RefreshToken {
  @PrimaryColumn()
  token: string;

  @Column()
  userId: string;

  @Column()
  expiryDate: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;
}
