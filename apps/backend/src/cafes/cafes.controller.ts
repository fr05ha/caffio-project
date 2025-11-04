import { Controller, Get, Param, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiQuery, ApiParam } from '@nestjs/swagger';
import { CafesService } from './cafes.service';

@ApiTags('cafes')
@Controller('cafes')
export class CafesController {
  constructor(private readonly cafesService: CafesService) {}

  @Get()
  @ApiQuery({ name: 'lat', required: false, type: Number })
  @ApiQuery({ name: 'lon', required: false, type: Number })
  async list(@Query('lat') lat?: string, @Query('lon') lon?: string) {
    if (lat && lon) {
      return this.cafesService.findNearest(Number(lat), Number(lon));
    }
    return this.cafesService.listSortedByRating();
  }

  @Get(':id')
  @ApiParam({ name: 'id', type: Number })
  async getById(@Param('id', ParseIntPipe) id: number) {
    return this.cafesService.getById(id);
  }
}
