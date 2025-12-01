import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcrypt';
import { URLSearchParams } from 'url';

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
    phone?: string;
    cafeEmail?: string;
    description?: string;
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

    // Derive location automatically when possible
    let latitude = typeof data.lat === 'number' ? data.lat : undefined;
    let longitude = typeof data.lon === 'number' ? data.lon : undefined;

    if ((latitude === undefined || longitude === undefined) && data.address) {
      const geocoded = await this.geocodeAddress(data.address);
      if (geocoded) {
        latitude = geocoded.lat;
        longitude = geocoded.lon;
      }
    }

    // Default business hours: 8:00 AM - 8:00 PM, all days enabled
    const defaultBusinessHours = {
      monday: { open: '08:00', close: '20:00', enabled: true },
      tuesday: { open: '08:00', close: '20:00', enabled: true },
      wednesday: { open: '08:00', close: '20:00', enabled: true },
      thursday: { open: '08:00', close: '20:00', enabled: true },
      friday: { open: '08:00', close: '20:00', enabled: true },
      saturday: { open: '08:00', close: '20:00', enabled: true },
      sunday: { open: '08:00', close: '20:00', enabled: true },
    };

    // Create cafe and user in a transaction
    const result = await this.db.$transaction(async (tx) => {
      // Create cafe
      const cafe = await tx.cafe.create({
        data: {
          name: data.cafeName,
          address: data.address || null,
          lat: latitude ?? 0, // Default to 0 if not provided
          lon: longitude ?? 0,
          primaryColor: data.primaryColor || null,
          secondaryColor: data.secondaryColor || null,
          accentColor: data.accentColor || null,
          logoUrl: data.logoUrl ?? null,
          theme: data.theme ?? null,
          ...(data.phone && { phone: data.phone }),
          ...(data.cafeEmail && { email: data.cafeEmail }),
          ...(data.description && { description: data.description }),
          businessHours: defaultBusinessHours as any, // Set default business hours
          ratingAvg: 0,
          ratingCount: 0,
          isCertified: false,
        } as any, // Type assertion to handle Prisma JSON types
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

  private async geocodeAddress(address: string): Promise<{ lat: number; lon: number } | null> {
    const params = new URLSearchParams({
      q: address,
      format: 'json',
      limit: '1',
    });
    const url = `https://nominatim.openstreetmap.org/search?${params.toString()}`;

    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'CaffioDashboard/1.0 (+https://caffio-project.vercel.app)',
        },
      });
      if (!response.ok) {
        return null;
      }
      const results = (await response.json()) as Array<{ lat: string; lon: string }>;
      if (!Array.isArray(results) || results.length === 0) {
        return null;
      }
      const first = results[0];
      const lat = parseFloat(first.lat);
      const lon = parseFloat(first.lon);
      if (Number.isNaN(lat) || Number.isNaN(lon)) {
        return null;
      }
      return { lat, lon };
    } catch (error) {
      console.error('Failed to geocode address', error);
      return null;
    }
  }
}

