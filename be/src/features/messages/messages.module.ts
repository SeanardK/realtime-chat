import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RoomsModule } from '../rooms/rooms.module';
import { Message } from './message.entity';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Message]),
    JwtModule.register({}),
    RoomsModule,
  ],
  controllers: [MessagesController],
  providers: [MessagesService, JwtAuthGuard],
  exports: [MessagesService],
})
export class MessagesModule {}
