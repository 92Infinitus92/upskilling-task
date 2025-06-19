import { Entity, Column, PrimaryColumn, CreateDateColumn } from 'typeorm';

@Entity()
export class Nonce {
  @PrimaryColumn()
  value: string;

  @Column({ nullable: true })
  siweMessage?: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  expiryDate?: Date;
}
