import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { loadConfiguration } from './shared/config/configuration';
import { DatabaseModule } from './shared/database/database.module';
import { HealthModule } from './features/health/health.module';
import { AuthModule } from './features/auth/auth.module';
import { UsersModule } from './features/users/users.module';
import { RoomsModule } from './features/rooms/rooms.module';
import { MessagesModule } from './features/messages/messages.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [loadConfiguration],
    }),
    DatabaseModule,
    HealthModule,
    AuthModule,
    UsersModule,
    RoomsModule,
    MessagesModule,
  ],
})
export class AppModule {}
