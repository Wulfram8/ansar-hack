import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities';
import { User } from '../../users/entities';

@Entity('files')
export class FileEntity extends BaseEntity {
  @Column() filename: string;
  @Column({ name: 'original_name' }) originalName: string;
  @Column({ name: 'mime_type' }) mimeType: string;
  @Column({ type: 'int' }) size: number;
  @Column() path: string;
  @Column({ name: 'related_entity_type', type: 'varchar', nullable: true }) @Index() relatedEntityType: string | null;
  @Column({ name: 'related_entity_id', type: 'uuid', nullable: true }) @Index() relatedEntityId: string | null;
  @Column({ name: 'uploaded_by' }) uploadedBy: string;
  @ManyToOne(() => User) @JoinColumn({ name: 'uploaded_by' }) uploader: User;
}
