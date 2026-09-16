import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsInt,
  IsIn,
  IsObject,
} from 'class-validator';
import { CmsSectionType } from '@cantt/types';

export class CreateCmsSectionDto {
  @IsOptional()
  @IsString()
  page?: string = 'home';

  @IsIn([
    'HERO_CAROUSEL',
    'CATEGORY_GRID',
    'PRODUCT_CAROUSEL',
    'BANNER',
    'TESTIMONIALS',
    'FORCE_REGIMENT_STRIP',
  ])
  type: CmsSectionType;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  subtitle?: string;

  @IsObject()
  config: Record<string, any>;

  @IsOptional()
  @IsInt()
  sortOrder?: number = 0;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;
}
