import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class UpsertCmsPageDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  bodyHtml: string;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean = true;
}
