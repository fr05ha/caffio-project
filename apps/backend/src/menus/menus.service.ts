import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class MenusService {
  constructor(private readonly db: PrismaService) {}

  async getByCafeId(cafeId: number) {
    return this.db.menu.findMany({
      where: { cafeId, isActive: true },
      include: { items: true },
    });
  }

  async create(data: { cafeId: number; name?: string }) {
    return this.db.menu.create({
      data: { cafeId: data.cafeId, name: data.name || 'Main' },
    });
  }

  async addMenuItem(data: { menuId: number; name: string; description?: string; price: number; currency?: string; imageUrl?: string; category?: string; customizations?: any }) {
    return this.db.menuItem.create({
      data: {
        menuId: data.menuId,
        name: data.name,
        description: data.description,
        price: data.price,
        currency: data.currency || 'AUD',
        imageUrl: data.imageUrl,
        category: data.category || 'Coffee',
        customizations: data.customizations || null,
      },
    });
  }

  async updateMenuItem(id: number, data: { name?: string; description?: string; price?: number; currency?: string; imageUrl?: string; category?: string; customizations?: any }) {
    return this.db.menuItem.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.price && { price: data.price }),
        ...(data.currency && { currency: data.currency }),
        ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
        ...(data.category !== undefined && { category: data.category }),
        ...(data.customizations !== undefined && { customizations: data.customizations }),
      },
    });
  }

  async deleteMenuItem(id: number) {
    return this.db.menuItem.delete({
      where: { id },
    });
  }
}
