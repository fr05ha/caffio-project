import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcrypt';

type CustomerSignupDto = {
  name?: string;
  email: string;
  password: string;
};

type FavoriteCafeDto = {
  cafeId: number;
};

type FavoriteMenuItemDto = {
  menuItemId: number;
};

@Injectable()
export class CustomersService {
  constructor(private readonly db: PrismaService) {}

  async signup(data: CustomerSignupDto) {
    const existing = await this.db.customer.findUnique({ where: { email: data.email } });
    if (existing) {
      throw new ConflictException('Email already registered');
    }
    const passwordHash = await bcrypt.hash(data.password, 10);
    const customer = await this.db.customer.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
      },
    });
    return this.serializeCustomer(customer);
  }

  async login(email: string, password: string) {
    const customer = await this.db.customer.findUnique({ where: { email } });
    if (!customer) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const isValid = await bcrypt.compare(password, customer.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Invalid email or password');
    }
    return this.serializeCustomer(customer);
  }

  async getProfile(id: number) {
    const customer = await this.db.customer.findUnique({
      where: { id },
      include: {
        favoriteCafes: { include: { cafe: true } },
        favoriteMenuItems: { include: { menuItem: true } },
      },
    });
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }
    return this.serializeCustomer(customer);
  }

  async addFavoriteCafe(customerId: number, data: FavoriteCafeDto) {
    await this.ensureCustomerExists(customerId);
    await this.db.cafe.findUniqueOrThrow({ where: { id: data.cafeId } });
    await this.db.customerFavoriteCafe.upsert({
      where: {
        customerId_cafeId: {
          customerId,
          cafeId: data.cafeId,
        },
      },
      update: {},
      create: {
        customerId,
        cafeId: data.cafeId,
      },
    });
    return this.getProfile(customerId);
  }

  async removeFavoriteCafe(customerId: number, cafeId: number) {
    await this.ensureCustomerExists(customerId);
    await this.db.customerFavoriteCafe.deleteMany({
      where: {
        customerId,
        cafeId,
      },
    });
    return this.getProfile(customerId);
  }

  async addFavoriteMenuItem(customerId: number, data: FavoriteMenuItemDto) {
    await this.ensureCustomerExists(customerId);
    await this.db.menuItem.findUniqueOrThrow({ where: { id: data.menuItemId } });
    await this.db.customerFavoriteMenuItem.upsert({
      where: {
        customerId_menuItemId: {
          customerId,
          menuItemId: data.menuItemId,
        },
      },
      update: {},
      create: {
        customerId,
        menuItemId: data.menuItemId,
      },
    });
    return this.getProfile(customerId);
  }

  async removeFavoriteMenuItem(customerId: number, menuItemId: number) {
      await this.ensureCustomerExists(customerId);
      await this.db.customerFavoriteMenuItem.deleteMany({
        where: {
          customerId,
          menuItemId,
        },
      });
      return this.getProfile(customerId);
  }

  private async ensureCustomerExists(customerId: number) {
    const exists = await this.db.customer.findUnique({ where: { id: customerId } });
    if (!exists) {
      throw new NotFoundException('Customer not found');
    }
  }

  private serializeCustomer(customer: any) {
    const { passwordHash, favoriteCafes, favoriteMenuItems, ...rest } = customer;
    return {
      ...rest,
      favoriteCafes: favoriteCafes?.map((fav: any) => fav.cafe) ?? [],
      favoriteMenuItems: favoriteMenuItems?.map((fav: any) => fav.menuItem) ?? [],
    };
  }
}

