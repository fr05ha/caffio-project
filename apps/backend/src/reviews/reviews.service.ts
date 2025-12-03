import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ReviewsService {
  constructor(private readonly db: PrismaService) {}

  async getByCafeId(cafeId: number) {
    return this.db.review.findMany({
      where: { cafeId },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: { cafeId: number; customerId?: number; customerName?: string; rating: number; text?: string }) {
    const review = await this.db.review.create({
      data: {
        cafeId: data.cafeId,
        customerId: data.customerId,
        customerName: data.customerName,
        rating: data.rating,
        text: data.text,
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Update cafe rating average and count
    await this.updateCafeRating(data.cafeId);

    return review;
  }

  private async updateCafeRating(cafeId: number) {
    const reviews = await this.db.review.findMany({
      where: { cafeId },
      select: { rating: true },
    });

    const ratingAvg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    const ratingCount = reviews.length;

    await this.db.cafe.update({
      where: { id: cafeId },
      data: { ratingAvg, ratingCount },
    });
  }
}
