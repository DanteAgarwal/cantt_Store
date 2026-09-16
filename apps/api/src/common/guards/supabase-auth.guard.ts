import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { PrismaService } from '../../prisma/prisma.service';

export interface AuthenticatedUser {
  id: string;
  email?: string;
  phone?: string;
  role: string;
  fullName?: string;
  avatarUrl?: string;
}

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid Authorization header');
    }

    const token = authHeader.split(' ')[1];
    const jwtSecret = this.configService.get<string>('SUPABASE_JWT_SECRET');

    if (!jwtSecret) {
      throw new UnauthorizedException('SUPABASE_JWT_SECRET is not configured on server');
    }

    let payload: any;
    try {
      payload = jwt.verify(token, jwtSecret);
    } catch (err: any) {
      throw new UnauthorizedException(`Invalid or expired token: ${err.message}`);
    }

    const userId = payload.sub;
    if (!userId) {
      throw new UnauthorizedException('Malformed token payload (no sub)');
    }

    // Lookup profile in public.profiles
    let profile = await this.prisma.profile.findUnique({
      where: { id: userId },
    });

    // Safety fallback: if trigger hasn't fired yet or edge case, create profile
    if (!profile) {
      profile = await this.prisma.profile.create({
        data: {
          id: userId,
          fullName: payload.user_metadata?.full_name ?? '',
          phone: payload.phone ?? null,
          role: 'CUSTOMER',
        },
      });
    }

    if (!profile.isActive) {
      throw new UnauthorizedException('User account has been deactivated');
    }

    request.user = {
      id: profile.id,
      email: payload.email,
      phone: profile.phone ?? payload.phone,
      role: profile.role,
      fullName: profile.fullName,
      avatarUrl: profile.avatarUrl,
    } as AuthenticatedUser;

    return true;
  }
}
