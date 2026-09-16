import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { GetProductsQueryDto } from './dto/get-products-query.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { SupabaseAuthGuard } from '../common/guards/supabase-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller()
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // -------------------------------------------------------------
  // Public Storefront Endpoints
  // -------------------------------------------------------------

  @Get('products')
  async getProducts(@Query() query: GetProductsQueryDto) {
    return this.productsService.getProducts(query);
  }

  @Get('products/featured')
  async getFeaturedProducts(@Query('limit') limit = '8') {
    return this.productsService.getFeaturedProducts(
      Math.max(1, Math.min(50, parseInt(limit, 10) || 8)),
    );
  }

  @Get('products/:slug')
  async getProductBySlug(@Param('slug') slug: string) {
    return this.productsService.getProductBySlug(slug);
  }

  @Get('products/:slug/related')
  async getRelatedProducts(
    @Param('slug') slug: string,
    @Query('limit') limit = '4',
  ) {
    return this.productsService.getRelatedProducts(
      slug,
      Math.max(1, Math.min(20, parseInt(limit, 10) || 4)),
    );
  }

  // -------------------------------------------------------------
  // Admin Endpoints (Protected: ADMIN / SUPER_ADMIN)
  // -------------------------------------------------------------

  @Get('admin/products')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  async getAllAdmin(@Query() query: GetProductsQueryDto) {
    return this.productsService.getAllAdmin(query);
  }

  @Post('admin/products')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  async create(@Body() dto: CreateProductDto) {
    return this.productsService.createProduct(dto);
  }

  @Patch('admin/products/:id')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productsService.updateProduct(id, dto);
  }

  @Post('admin/products/:id/publish')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  async publish(@Param('id') id: string) {
    return this.productsService.publishProduct(id);
  }

  @Post('admin/products/:id/unpublish')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  async unpublish(@Param('id') id: string) {
    return this.productsService.unpublishProduct(id);
  }

  @Patch('admin/variants/:id/inventory')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  async updateInventory(
    @Param('id') id: string,
    @Body() dto: UpdateInventoryDto,
  ) {
    return this.productsService.updateInventory(id, dto);
  }
}
