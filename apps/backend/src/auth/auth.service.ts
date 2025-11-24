import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private readonly db: PrismaService) {}

  async login(email: string, password: string) {
    const user = await this.db.user.findUnique({
      where: { email },
      include: { cafe: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Return user data without password hash
    const { passwordHash, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      cafe: user.cafe,
    };
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async signup(data: {
    email: string;
    password: string;
    cafeName: string;
    address?: string;
    lat?: number;
    lon?: number;
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
    logoUrl?: string;
    theme?: string;
  }) {
    // Check if user already exists
    const existingUser = await this.db.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new UnauthorizedException('Email already registered');
    }

    // Hash password
    const passwordHash = await this.hashPassword(data.password);

    // Create cafe and user in a transaction
    const result = await this.db.$transaction(async (tx) => {
      // Create cafe
      const cafe = await tx.cafe.create({
        data: {
          name: data.cafeName,
          address: data.address || null,
          lat: data.lat || 0, // Default to 0 if not provided
          lon: data.lon || 0,
          primaryColor: data.primaryColor || null,
          secondaryColor: data.secondaryColor || null,
          accentColor: data.accentColor || null,
          logoUrl: data.logoUrl || null,
          theme: data.theme || null,
          ratingAvg: 0,
          ratingCount: 0,
          isCertified: false,
        },
      });

      // Create user linked to cafe
      const user = await tx.user.create({
        data: {
          email: data.email,
          passwordHash,
          cafeId: cafe.id,
        },
        include: { cafe: true },
      });

      return { user, cafe };
    });

    // Return user data without password hash
    const { passwordHash: _, ...userWithoutPassword } = result.user;
    return {
      user: userWithoutPassword,
      cafe: result.cafe,
    };
  }
}

