import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
} from 'typeorm';

@Entity('room_members')
export class RoomMember {
  @PrimaryColumn({ name: 'room_id' })
  roomId: string;

  @PrimaryColumn({ name: 'user_id' })
  userId: string;

  @Column({ name: 'last_read_message_id', type: 'uuid', nullable: true })
  lastReadMessageId: string | null;

  @CreateDateColumn({ name: 'joined_at' })
  joinedAt: Date;
}
