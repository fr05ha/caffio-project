import { Controller, Get, Post, Put, Param, Body, ParseIntPipe, Query } from '@nestjs/common';
import { ApiTags, ApiParam, ApiBody, ApiQuery } from '@nestjs/swagger';
import { OrdersService } from './orders.service';

@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiBody({
    schema: {
      properties: {
        customerId: { type: 'number' },
        cafeId: { type: 'number' },
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              menuItemId: { type: 'number' },
              quantity: { type: 'number' },
            },
          },
        },
        orderType: { type: 'string', enum: ['DINE_IN', 'TAKE_AWAY', 'DELIVERY'] },
        deliveryAddress: { type: 'string' },
        customerPhone: { type: 'string' },
        customerName: { type: 'string' },
        notes: { type: 'string' },
      },
    },
  })
  async create(@Body() data: {
    customerId: number;
    cafeId: number;
    items: Array<{ menuItemId: number; quantity: number }>;
    orderType?: 'DINE_IN' | 'TAKE_AWAY' | 'DELIVERY';
    deliveryAddress?: string;
    customerPhone?: string;
    customerName?: string;
    notes?: string;
  }) {
    return this.ordersService.create(data);
  }

  @Get()
  @ApiQuery({ name: 'cafeId', required: false, type: Number })
  @ApiQuery({ name: 'customerId', required: false, type: Number })
  async list(@Query('cafeId') cafeId?: string, @Query('customerId') customerId?: string) {
    if (cafeId) {
      return this.ordersService.findByCafe(Number(cafeId));
    }
    if (customerId) {
      return this.ordersService.findByCustomer(Number(customerId));
    }
    return [];
  }

  @Get(':id')
  @ApiParam({ name: 'id', type: Number })
  async getById(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.findById(id);
  }

  @Put(':id/status')
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({
    schema: {
      properties: {
        status: {
          type: 'string',
          enum: ['pending', 'preparing', 'ready', 'on_the_way', 'delivered', 'cancelled'],
        },
      },
    },
  })
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: { status: string },
  ) {
    return this.ordersService.updateStatus(id, data.status);
  }
}

