export interface AppConfig {
  nodeEnv: string;
  port: number;
  database: {
    host: string;
    port: number;
    user: string;
    password: string;
    name: string;
    synchronize: boolean;
  };
  jwt: {
    accessSecret: string;
    refreshSecret: string;
    accessTtl: string;
    refreshTtl: string;
  };
  corsOrigin: string;
}

export const loadConfiguration = (): AppConfig => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '4000', 10),
  database: {
    host: process.env.DATABASE_HOST ?? 'localhost',
    port: parseInt(process.env.DATABASE_PORT ?? '5432', 10),
    user: process.env.DATABASE_USER ?? 'chat',
    password: process.env.DATABASE_PASSWORD ?? 'chat',
    name: process.env.DATABASE_NAME ?? 'chat',
    synchronize: (process.env.NODE_ENV ?? 'development') !== 'production',
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET ?? 'change_me_access',
    refreshSecret: process.env.JWT_REFRESH_SECRET ?? 'change_me_refresh',
    accessTtl: process.env.JWT_ACCESS_TTL ?? '900s',
    refreshTtl: process.env.JWT_REFRESH_TTL ?? '7d',
  },
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
});
