import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ApiTags, ApiBody, ApiParam } from '@nestjs/swagger';
import { CustomersService } from './customers.service';

@ApiTags('customers')
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post('signup')
  @ApiBody({
    schema: {
      required: ['email', 'password'],
      properties: {
        name: { type: 'string' },
        email: { type: 'string', example: 'user@example.com' },
        password: { type: 'string', example: 'Password123!' },
      },
    },
  })
  async signup(@Body() body: { name?: string; email: string; password: string }) {
    return this.customersService.signup(body);
  }

  @Post('login')
  @ApiBody({
    schema: {
      required: ['email', 'password'],
      properties: {
        email: { type: 'string' },
        password: { type: 'string' },
      },
    },
  })
  async login(@Body() body: { email: string; password: string }) {
    return this.customersService.login(body.email, body.password);
  }

  @Get(':id')
  @ApiParam({ name: 'id', type: Number })
  async getProfile(@Param('id', ParseIntPipe) id: number) {
    return this.customersService.getProfile(id);
  }

  @Post(':id/favorites/cafes')
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ schema: { required: ['cafeId'], properties: { cafeId: { type: 'number' } } } })
  async addFavoriteCafe(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { cafeId: number },
  ) {
    return this.customersService.addFavoriteCafe(id, body);
  }

  @Delete(':id/favorites/cafes/:cafeId')
  @ApiParam({ name: 'id', type: Number })
  @ApiParam({ name: 'cafeId', type: Number })
  async removeFavoriteCafe(
    @Param('id', ParseIntPipe) id: number,
    @Param('cafeId', ParseIntPipe) cafeId: number,
  ) {
    return this.customersService.removeFavoriteCafe(id, cafeId);
  }

  @Post(':id/favorites/menu-items')
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ schema: { required: ['menuItemId'], properties: { menuItemId: { type: 'number' } } } })
  async addFavoriteMenuItem(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { menuItemId: number },
  ) {
    return this.customersService.addFavoriteMenuItem(id, body);
  }

  @Delete(':id/favorites/menu-items/:menuItemId')
  @ApiParam({ name: 'id', type: Number })
  @ApiParam({ name: 'menuItemId', type: Number })
  async removeFavoriteMenuItem(
    @Param('id', ParseIntPipe) id: number,
    @Param('menuItemId', ParseIntPipe) menuItemId: number,
  ) {
    return this.customersService.removeFavoriteMenuItem(id, menuItemId);
  }
}

