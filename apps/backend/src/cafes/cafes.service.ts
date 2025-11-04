import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class CafesService {
  constructor(private readonly db: PrismaService) {}

  async listSortedByRating() {
    return this.db.cafe.findMany({ orderBy: { ratingAvg: 'desc' } });
  }

  async findNearest(lat: number, lon: number) {
    // Basic nearest using computed distance formula in SQL via Prisma $queryRaw
    return this.db.$queryRawUnsafe<any[]>(
      `SELECT *, (6371 * acos(cos(radians($1)) * cos(radians(lat)) * cos(radians(lon) - radians($2)) + sin(radians($1)) * sin(radians(lat)))) as distance
       FROM "Cafe"
       ORDER BY distance ASC
       LIMIT 20`,
      lat,
      lon,
    );
  }

  async getById(id: number) {
    return this.db.cafe.findUnique({
      where: { id },
      include: {
        menus: { include: { items: true } },
        reviews: true,
      },
    });
  }
}

