import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities';
import { User } from '../../users/entities';

@Entity('api_tokens')
export class ApiToken extends BaseEntity {
  @Column()
  name: string;

  @Column({ name: 'token_hash' })
  tokenHash: string;

  @Column({ name: 'token_prefix', length: 8 })
  tokenPrefix: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, (user) => user.apiTokens, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column('simple-array', { nullable: true })
  scopes: string[];

  @Column({ name: 'last_used_at', type: 'timestamp', nullable: true })
  lastUsedAt: Date | null;

  @Column({ name: 'expires_at', type: 'timestamp', nullable: true })
  expiresAt: Date | null;

  @Column({ name: 'is_revoked', default: false })
  isRevoked: boolean;
}
