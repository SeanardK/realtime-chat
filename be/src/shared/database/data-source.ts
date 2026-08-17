import { DataSource } from 'typeorm';
import { loadConfiguration } from '../config/configuration';

const config = loadConfiguration();

export default new DataSource({
  type: 'postgres',
  host: config.database.host,
  port: config.database.port,
  username: config.database.user,
  password: config.database.password,
  database: config.database.name,
  entities: ['src/features/**/*.entity.ts'],
  migrations: ['src/shared/database/migrations/*.ts'],
});
