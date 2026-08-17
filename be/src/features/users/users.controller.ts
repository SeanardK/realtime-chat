import {
  Body,
  Controller,
  Get,
  Put,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { User } from './user.entity';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get('me')
  async me(@CurrentUser() userId: string) {
    return this.toProfile(await this.users.findById(userId));
  }

  @Put('me')
  async updateMe(
    @CurrentUser() userId: string,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.toProfile(
      await this.users.updateProfile(userId, dto.displayName),
    );
  }

  @Get('contacts')
  async contacts(@CurrentUser() userId: string) {
    const list = await this.users.contacts(userId);
    return list.map((user) => this.toProfile(user));
  }

  private toProfile(user: User) {
    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      createdAt: user.createdAt,
    };
  }
}
