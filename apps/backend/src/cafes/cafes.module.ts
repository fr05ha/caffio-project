import { Module } from '@nestjs/common';
import { CafesService } from './cafes.service';
import { CafesController } from './cafes.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [CafesController],
  providers: [CafesService, PrismaService],
})
export class CafesModule {}

