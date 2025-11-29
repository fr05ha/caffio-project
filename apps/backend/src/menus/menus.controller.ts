import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiParam, ApiBody } from '@nestjs/swagger';
import { MenusService } from './menus.service';

@ApiTags('menus')
@Controller('menus')
export class MenusController {
  constructor(private readonly menusService: MenusService) {}

  @Get(':cafeId')
  @ApiParam({ name: 'cafeId', type: Number })
  async getByCafeId(@Param('cafeId', ParseIntPipe) cafeId: number) {
    return this.menusService.getByCafeId(cafeId);
  }

  @Post()
  @ApiBody({ schema: { properties: { cafeId: { type: 'number' }, name: { type: 'string' } } } })
  async create(@Body() data: { cafeId: number; name?: string }) {
    return this.menusService.create(data);
  }

  @Post('items')
  @ApiBody({ schema: { properties: { menuId: { type: 'number' }, name: { type: 'string' }, description: { type: 'string' }, price: { type: 'number' }, currency: { type: 'string' }, imageUrl: { type: 'string' } } } })
  async addMenuItem(@Body() data: { menuId: number; name: string; description?: string; price: number; currency?: string; imageUrl?: string }) {
    return this.menusService.addMenuItem(data);
  }

  @Put('items/:id')
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ schema: { properties: { name: { type: 'string' }, description: { type: 'string' }, price: { type: 'number' }, currency: { type: 'string' }, imageUrl: { type: 'string' } } } })
  async updateMenuItem(@Param('id', ParseIntPipe) id: number, @Body() data: { name?: string; description?: string; price?: number; currency?: string; imageUrl?: string }) {
    return this.menusService.updateMenuItem(id, data);
  }

  @Delete('items/:id')
  @ApiParam({ name: 'id', type: Number })
  async deleteMenuItem(@Param('id', ParseIntPipe) id: number) {
    return this.menusService.deleteMenuItem(id);
  }
}
