import { IsInt, Min, IsOptional } from 'class-validator';

export class UpdateInventoryDto {
  @IsInt()
  @Min(0)
  quantity: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  lowStockAt?: number;
}
