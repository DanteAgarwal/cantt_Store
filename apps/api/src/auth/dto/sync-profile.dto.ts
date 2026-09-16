import { IsOptional, IsString } from 'class-validator';

export class SyncProfileDto {
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsString()
  phone?: string;
}
