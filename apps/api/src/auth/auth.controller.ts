import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SyncProfileDto } from './dto/sync-profile.dto';
import { SupabaseAuthGuard, AuthenticatedUser } from '../common/guards/supabase-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('auth/sync-profile')
  @UseGuards(SupabaseAuthGuard)
  async syncProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: SyncProfileDto,
  ) {
    return this.authService.syncProfile(user.id, dto);
  }

  @Get('me')
  @UseGuards(SupabaseAuthGuard)
  async getMe(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.getProfile(user.id);
  }
}
