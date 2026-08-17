import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { loadConfiguration } from './shared/config/configuration';
import { DatabaseModule } from './shared/database/database.module';
import { HealthModule } from './features/health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [loadConfiguration],
    }),
    DatabaseModule,
    HealthModule,
  ],
})
export class AppModule {}
