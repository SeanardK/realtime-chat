import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Room } from './room.entity';
import { RoomMember } from './room-member.entity';
import { RoomsController } from './rooms.controller';
import { RoomsService } from './rooms.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Room, RoomMember]),
    JwtModule.register({}),
  ],
  controllers: [RoomsController],
  providers: [RoomsService, JwtAuthGuard],
  exports: [RoomsService],
})
export class RoomsModule {}
