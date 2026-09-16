import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ReorderCategoriesDto } from './dto/reorder-categories.dto';
import { SupabaseAuthGuard } from '../common/guards/supabase-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller()
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  // -------------------------------------------------------------
  // Public Storefront Endpoints
  // -------------------------------------------------------------

  @Get('categories')
  async getCategoryTree() {
    return this.categoriesService.getCategoryTree();
  }

  @Get('categories/:slug')
  async getCategoryBySlug(
    @Param('slug') slug: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.categoriesService.getCategoryBySlug(
      slug,
      Math.max(1, parseInt(page, 10) || 1),
      Math.max(1, Math.min(100, parseInt(limit, 10) || 20)),
    );
  }

  // -------------------------------------------------------------
  // Admin Endpoints (Protected: ADMIN / SUPER_ADMIN)
  // -------------------------------------------------------------

  @Get('admin/categories')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  async getAllAdmin() {
    return this.categoriesService.getAllCategoriesAdmin();
  }

  @Post('admin/categories')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  async create(@Body() dto: CreateCategoryDto) {
    return this.categoriesService.createCategory(dto);
  }

  @Patch('admin/categories/reorder')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  async reorder(@Body() dto: ReorderCategoriesDto) {
    return this.categoriesService.reorderCategories(dto);
  }

  @Patch('admin/categories/:id')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.categoriesService.updateCategory(id, dto);
  }

  @Delete('admin/categories/:id')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  async delete(@Param('id') id: string) {
    return this.categoriesService.deleteCategory(id);
  }
}
