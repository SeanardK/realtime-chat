import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
  ) {}

  create(data: {
    email: string;
    passwordHash: string;
    displayName: string;
  }): Promise<User> {
    const user = this.users.create(data);
    return this.users.save(user);
  }

  findByEmail(email: string): Promise<User | null> {
    return this.users.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User> {
    const user = await this.users.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async updateProfile(id: string, displayName: string): Promise<User> {
    const user = await this.findById(id);
    user.displayName = displayName;
    return this.users.save(user);
  }

  contacts(excludeId: string): Promise<User[]> {
    return this.users.find({
      where: { id: Not(excludeId) },
      order: { displayName: 'ASC' },
    });
  }
}
