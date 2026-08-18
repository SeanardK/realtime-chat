import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createHash } from 'crypto';
import * as bcrypt from 'bcrypt';
import { AppConfig } from '../../shared/config/configuration';
import { UsersService } from '../users/users.service';
import { RefreshToken } from './refresh-token.entity';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

interface RefreshPayload {
  sub: string;
  jti: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService<AppConfig, true>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokens: Repository<RefreshToken>,
  ) {}

  async register(
    email: string,
    password: string,
    displayName: string,
  ): Promise<TokenPair> {
    const existing = await this.users.findByEmail(email);
    if (existing) {
      throw new ConflictException('Email already registered');
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await this.users.create({ email, passwordHash, displayName });
    return this.issueTokens(user.id, null);
  }

  async login(email: string, password: string): Promise<TokenPair> {
    const user = await this.users.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.issueTokens(user.id, null);
  }

  async refresh(rawToken: string): Promise<TokenPair> {
    let payload: RefreshPayload;
    try {
      payload = await this.jwt.verifyAsync<RefreshPayload>(rawToken, {
        secret: this.config.get('jwt.refreshSecret', { infer: true }),
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const stored = await this.refreshTokens.findOne({
      where: { id: payload.jti },
    });
    if (!stored) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    if (stored.revoked) {
      await this.revokeAllForUser(stored.userId);
      throw new UnauthorizedException('Refresh token reuse detected');
    }
    if (stored.tokenHash !== this.hash(rawToken)) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    if (stored.expiresAt.getTime() < Date.now()) {
      throw new UnauthorizedException('Refresh token expired');
    }

    stored.revoked = true;
    await this.refreshTokens.save(stored);
    return this.issueTokens(stored.userId, stored.id);
  }

  private async issueTokens(
    userId: string,
    rotatedFrom: string | null,
  ): Promise<TokenPair> {
    const accessToken = await this.jwt.signAsync(
      { sub: userId },
      {
        secret: this.config.get('jwt.accessSecret', { infer: true }),
        expiresIn: this.config.get('jwt.accessTtl', { infer: true }),
      },
    );

    const record = await this.refreshTokens.save(
      this.refreshTokens.create({
        userId,
        tokenHash: '',
        expiresAt: new Date(),
        rotatedFrom,
        revoked: false,
      }),
    );

    const refreshToken = await this.jwt.signAsync(
      { sub: userId, jti: record.id },
      {
        secret: this.config.get('jwt.refreshSecret', { infer: true }),
        expiresIn: this.config.get('jwt.refreshTtl', { infer: true }),
      },
    );

    const decoded = this.jwt.decode(refreshToken) as { exp: number };
    record.tokenHash = this.hash(refreshToken);
    record.expiresAt = new Date(decoded.exp * 1000);
    await this.refreshTokens.save(record);

    return { accessToken, refreshToken };
  }

  private async revokeAllForUser(userId: string): Promise<void> {
    await this.refreshTokens.update({ userId }, { revoked: true });
  }

  private hash(value: string): string {
    return createHash('sha256').update(value).digest('hex');
  }
}
