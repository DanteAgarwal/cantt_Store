import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SyncProfileDto } from './dto/sync-profile.dto';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async syncProfile(userId: string, dto: SyncProfileDto) {
    return this.prisma.profile.upsert({
      where: { id: userId },
      update: {
        ...(dto.fullName ? { fullName: dto.fullName } : {}),
        ...(dto.phone ? { phone: dto.phone } : {}),
      },
      create: {
        id: userId,
        fullName: dto.fullName ?? '',
        phone: dto.phone ?? null,
        role: 'CUSTOMER',
      },
    });
  }

  async getProfile(userId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: {
            orders: true,
            addresses: true,
            reviews: true,
          },
        },
      },
    });

    if (!profile) {
      throw new NotFoundException('User profile not found');
    }

    return profile;
  }
}
