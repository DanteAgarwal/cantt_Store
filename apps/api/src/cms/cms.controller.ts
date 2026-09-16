import {
  Controller,
  Get,
  Post,
  Patch,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { CmsService } from './cms.service';
import { CreateCmsSectionDto } from './dto/create-section.dto';
import { UpdateCmsSectionDto } from './dto/update-section.dto';
import { UpsertCmsPageDto } from './dto/upsert-page.dto';
import { CreateBannerDto } from './dto/create-banner.dto';
import { SupabaseAuthGuard } from '../common/guards/supabase-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller()
export class CmsController {
  constructor(private readonly cmsService: CmsService) {}

  // -------------------------------------------------------------
  // Public Endpoints
  // -------------------------------------------------------------

  @Get('cms/homepage')
  async getHomepage() {
    return this.cmsService.getHomepage();
  }

  @Get('cms/pages/:slug')
  async getPageBySlug(@Param('slug') slug: string) {
    return this.cmsService.getPageBySlug(slug);
  }

  // -------------------------------------------------------------
  // Admin Endpoints (Protected: ADMIN / SUPER_ADMIN)
  // -------------------------------------------------------------

  @Get('admin/cms/sections')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  async getAllSections() {
    return this.cmsService.getAllSections();
  }

  @Post('admin/cms/sections')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  async createSection(@Body() dto: CreateCmsSectionDto) {
    return this.cmsService.createSection(dto);
  }

  @Patch('admin/cms/sections/:id')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  async updateSection(
    @Param('id') id: string,
    @Body() dto: UpdateCmsSectionDto,
  ) {
    return this.cmsService.updateSection(id, dto);
  }

  @Delete('admin/cms/sections/:id')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  async deleteSection(@Param('id') id: string) {
    return this.cmsService.deleteSection(id);
  }

  @Get('admin/cms/pages')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  async getAllPages() {
    return this.cmsService.getAllPages();
  }

  @Put('admin/cms/pages/:slug')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  async upsertPage(
    @Param('slug') slug: string,
    @Body() dto: UpsertCmsPageDto,
  ) {
    return this.cmsService.upsertPage(slug, dto);
  }

  @Get('admin/banners')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  async getAllBanners() {
    return this.cmsService.getAllBanners();
  }

  @Post('admin/banners')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  async createBanner(@Body() dto: CreateBannerDto) {
    return this.cmsService.createBanner(dto);
  }

  @Delete('admin/banners/:id')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  async deleteBanner(@Param('id') id: string) {
    return this.cmsService.deleteBanner(id);
  }
}
