import { IsArray, ValidateNested, IsUUID, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class CategoryOrderItemDto {
  @IsUUID()
  id: string;

  @IsInt()
  sortOrder: number;
}

export class ReorderCategoriesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CategoryOrderItemDto)
  items: CategoryOrderItemDto[];
}
