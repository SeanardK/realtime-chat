import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { RefreshToken } from './refresh-token.entity';
import { User } from '../users/user.entity';

type StoredToken = Partial<RefreshToken>;

const createRepoMock = () => {
  const rows: StoredToken[] = [];
  let seq = 0;
  return {
    rows,
    create: (data: StoredToken) => ({ ...data }),
    save: jest.fn(async (row: StoredToken) => {
      if (!row.id) {
        row.id = `token-${++seq}`;
        rows.push(row);
      }
      return row;
    }),
    findOne: jest.fn(async ({ where }: { where: { id: string } }) =>
      rows.find((r) => r.id === where.id) ?? null,
    ),
    update: jest.fn(async (where: { userId: string }, patch: StoredToken) => {
      rows
        .filter((r) => r.userId === where.userId)
        .forEach((r) => Object.assign(r, patch));
    }),
  };
};

const createJwtMock = () => ({
  signAsync: jest.fn(async (payload: Record<string, unknown>) =>
    payload.jti ? `refresh.${String(payload.jti)}` : `access.${String(payload.sub)}`,
  ),
  verifyAsync: jest.fn(),
  decode: jest.fn(() => ({ exp: Math.floor(Date.now() / 1000) + 3600 })),
});

const config = {
  get: jest.fn((key: string) => key),
} as never;

describe('AuthService', () => {
  const buildUser = async (): Promise<User> => ({
    id: 'user-1',
    email: 'a@test.com',
    passwordHash: await bcrypt.hash('password123', 10),
    displayName: 'Ann',
    createdAt: new Date(),
  });

  it('rejects registration when email already exists', async () => {
    const users = {
      findByEmail: jest.fn(async () => await buildUser()),
      create: jest.fn(),
    };
    const service = new AuthService(
      users as never,
      createJwtMock() as never,
      config,
      createRepoMock() as never,
    );

    await expect(
      service.register('a@test.com', 'password123', 'Ann'),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('registers a new user and returns a token pair', async () => {
    const users = {
      findByEmail: jest.fn(async () => null),
      create: jest.fn(async (data: Partial<User>) => ({
        id: 'user-1',
        createdAt: new Date(),
        ...data,
      })),
    };
    const service = new AuthService(
      users as never,
      createJwtMock() as never,
      config,
      createRepoMock() as never,
    );

    const pair = await service.register('a@test.com', 'password123', 'Ann');

    expect(users.create).toHaveBeenCalled();
    expect(pair.accessToken).toContain('access.');
    expect(pair.refreshToken).toContain('refresh.');
  });

  it('rejects login with wrong password', async () => {
    const users = {
      findByEmail: jest.fn(async () => await buildUser()),
      create: jest.fn(),
    };
    const service = new AuthService(
      users as never,
      createJwtMock() as never,
      config,
      createRepoMock() as never,
    );

    await expect(
      service.login('a@test.com', 'wrong'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('logs in with correct password', async () => {
    const users = {
      findByEmail: jest.fn(async () => await buildUser()),
      create: jest.fn(),
    };
    const service = new AuthService(
      users as never,
      createJwtMock() as never,
      config,
      createRepoMock() as never,
    );

    const pair = await service.login('a@test.com', 'password123');
    expect(pair.accessToken).toContain('access.');
  });

  it('rotates the refresh token and revokes the old one', async () => {
    const repo = createRepoMock();
    const jwt = createJwtMock();
    const service = new AuthService(
      { findByEmail: jest.fn(), create: jest.fn() } as never,
      jwt as never,
      config,
      repo as never,
    );

    const issued = await (service as never as {
      issueTokens: (id: string, from: string | null) => Promise<{ refreshToken: string }>;
    }).issueTokens('user-1', null);

    jwt.verifyAsync.mockResolvedValue({ sub: 'user-1', jti: 'token-1' });

    const rotated = await service.refresh(issued.refreshToken);

    expect(rotated.refreshToken).toContain('refresh.');
    expect(repo.rows.find((r) => r.id === 'token-1')?.revoked).toBe(true);
  });

  it('detects refresh token reuse and revokes all user tokens', async () => {
    const repo = createRepoMock();
    const jwt = createJwtMock();
    const service = new AuthService(
      { findByEmail: jest.fn(), create: jest.fn() } as never,
      jwt as never,
      config,
      repo as never,
    );

    repo.rows.push({
      id: 'token-1',
      userId: 'user-1',
      tokenHash: 'x',
      expiresAt: new Date(Date.now() + 10000),
      revoked: true,
      rotatedFrom: null,
    });
    jwt.verifyAsync.mockResolvedValue({ sub: 'user-1', jti: 'token-1' });

    await expect(service.refresh('anything')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(repo.update).toHaveBeenCalledWith(
      { userId: 'user-1' },
      { revoked: true },
    );
  });
});
