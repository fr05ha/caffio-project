import { Controller, Get, Put, Param, Query, Body, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiQuery, ApiParam, ApiBody } from '@nestjs/swagger';
import { CafesService } from './cafes.service';

@ApiTags('cafes')
@Controller('cafes')
export class CafesController {
  constructor(private readonly cafesService: CafesService) {}

  @Get()
  @ApiQuery({ name: 'lat', required: false, type: Number })
  @ApiQuery({ name: 'lon', required: false, type: Number })
  async list(@Query('lat') lat?: string, @Query('lon') lon?: string) {
    let cafes;
    if (lat && lon) {
      cafes = await this.cafesService.findNearest(Number(lat), Number(lon));
    } else {
      cafes = await this.cafesService.listSortedByRating();
    }
    // Add isOpen status to each cafe
    return cafes.map(cafe => {
      const isOpen = this.cafesService.isCafeOpen(cafe.businessHours as any);
      // Ensure isOpen is always a boolean
      return {
        ...cafe,
        isOpen: Boolean(isOpen),
      };
    });
  }

  @Get(':id')
  @ApiParam({ name: 'id', type: Number })
  async getById(@Param('id', ParseIntPipe) id: number) {
    const cafe = await this.cafesService.getById(id);
    if (cafe) {
      // Add isOpen status based on business hours
      const isOpen = this.cafesService.isCafeOpen(cafe.businessHours as any);
      // Ensure isOpen is always a boolean
      return { ...cafe, isOpen: Boolean(isOpen) };
    }
    return cafe;
  }

  @Put(':id')
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({
    schema: {
      properties: {
        name: { type: 'string' },
        address: { type: 'string' },
        phone: { type: 'string' },
        email: { type: 'string' },
        description: { type: 'string' },
        primaryColor: { type: 'string' },
        secondaryColor: { type: 'string' },
        accentColor: { type: 'string' },
        logoUrl: { type: 'string' },
        theme: { type: 'string' },
        businessHours: { type: 'object' },
        profileImageUrl: { type: 'string' },
      },
    },
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    data: {
      name?: string;
      address?: string;
      phone?: string;
      email?: string;
      description?: string;
      primaryColor?: string;
      secondaryColor?: string;
      accentColor?: string;
      logoUrl?: string;
      theme?: string;
      businessHours?: any;
      profileImageUrl?: string;
    },
  ) {
    return this.cafesService.update(id, data);
  }
}
