import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class OrdersService {
  constructor(private readonly db: PrismaService) {}

  async create(data: {
    customerId: number;
    cafeId: number;
    items: Array<{ menuItemId: number; quantity: number }>;
    deliveryAddress?: string;
    customerPhone?: string;
    customerName?: string;
    notes?: string;
  }) {
    // Calculate total and get item details
    const menuItems = await this.db.menuItem.findMany({
      where: {
        id: { in: data.items.map((item) => item.menuItemId) },
      },
    });

    let total = 0;
    const orderItems = data.items.map((item) => {
      const menuItem = menuItems.find((mi) => mi.id === item.menuItemId);
      if (!menuItem) {
        throw new NotFoundException(`Menu item ${item.menuItemId} not found`);
      }
      const itemTotal = menuItem.price * item.quantity;
      total += itemTotal;
      return {
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        price: menuItem.price,
        name: menuItem.name,
        description: menuItem.description,
      };
    });

    // Create order with items in a transaction
    return this.db.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          customerId: data.customerId,
          cafeId: data.cafeId,
          total,
          deliveryAddress: data.deliveryAddress,
          customerPhone: data.customerPhone,
          customerName: data.customerName,
          notes: data.notes,
          status: 'pending',
          items: {
            create: orderItems,
          },
        },
        include: {
          items: {
            include: {
              menuItem: true,
            },
          },
          customer: true,
          cafe: true,
        },
      });
      return order;
    });
  }

  async findByCafe(cafeId: number) {
    return this.db.order.findMany({
      where: { cafeId },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
        customer: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByCustomer(customerId: number) {
    return this.db.order.findMany({
      where: { customerId },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
        cafe: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: number) {
    const order = await this.db.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
        customer: true,
        cafe: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Order ${id} not found`);
    }

    return order;
  }

  async updateStatus(id: number, status: string) {
    const validStatuses = ['pending', 'preparing', 'ready', 'on_the_way', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status: ${status}`);
    }

    return this.db.order.update({
      where: { id },
      data: { status },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
        customer: true,
        cafe: true,
      },
    });
  }
}

