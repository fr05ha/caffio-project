import { Controller, Get, Post, Body, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiParam, ApiBody } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';

@ApiTags('reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get(':cafeId')
  @ApiParam({ name: 'cafeId', type: Number })
  async getByCafeId(@Param('cafeId', ParseIntPipe) cafeId: number) {
    return this.reviewsService.getByCafeId(cafeId);
  }

  @Post()
  @ApiBody({ 
    schema: { 
      properties: { 
        cafeId: { type: 'number' }, 
        customerId: { type: 'number' },
        customerName: { type: 'string' },
        rating: { type: 'number' }, 
        text: { type: 'string' } 
      } 
    } 
  })
  async create(@Body() data: { cafeId: number; customerId?: number; customerName?: string; rating: number; text?: string }) {
    return this.reviewsService.create(data);
  }
}
