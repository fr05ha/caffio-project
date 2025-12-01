import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class CafesService {
  constructor(private readonly db: PrismaService) {}

  async listSortedByRating() {
    return this.db.cafe.findMany({ 
      orderBy: { ratingAvg: 'desc' },
      include: {
        menus: { include: { items: true } },
        reviews: true,
      },
    });
  }

  async findNearest(lat: number, lon: number) {
    // Get all cafes with their relations
    const cafes = await this.db.cafe.findMany({
      include: {
        menus: { include: { items: true } },
        reviews: true,
      },
    });
    
    // Calculate distance and sort
    const cafesWithDistance = cafes.map(cafe => {
      const distance = 6371 * Math.acos(
        Math.cos(this.toRadians(lat)) * 
        Math.cos(this.toRadians(cafe.lat)) * 
        Math.cos(this.toRadians(cafe.lon) - this.toRadians(lon)) + 
        Math.sin(this.toRadians(lat)) * 
        Math.sin(this.toRadians(cafe.lat))
      );
      return { ...cafe, distance };
    });
    
    // Sort by distance and return top 20
    return cafesWithDistance
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 20);
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
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

  async update(id: number, data: {
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
  }) {
    return this.db.cafe.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.address !== undefined && { address: data.address }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.email !== undefined && { email: data.email }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.primaryColor !== undefined && { primaryColor: data.primaryColor }),
        ...(data.secondaryColor !== undefined && { secondaryColor: data.secondaryColor }),
        ...(data.accentColor !== undefined && { accentColor: data.accentColor }),
        ...(data.logoUrl !== undefined && { logoUrl: data.logoUrl }),
        ...(data.theme !== undefined && { theme: data.theme }),
        ...(data.businessHours !== undefined && { businessHours: data.businessHours }),
      },
    });
  }

  isCafeOpen(businessHours: any): boolean {
    try {
      // Handle null, undefined, or empty values - default to open if not set
      if (!businessHours) {
        return true; // Default to open if business hours not configured
      }

      // Handle Prisma JSON type - it might be a string that needs parsing
      let hours = businessHours;
      if (typeof businessHours === 'string') {
        try {
          hours = JSON.parse(businessHours);
        } catch {
          return true; // Default to open if parsing fails
        }
      }

      // Check if hours is an object (not null, not array, not primitive)
      if (typeof hours !== 'object' || hours === null || Array.isArray(hours)) {
        return true; // Default to open if invalid format
      }

      const now = new Date();
      const dayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][now.getDay()];
      const dayHours = hours[dayName];

      if (!dayHours || typeof dayHours !== 'object' || !dayHours.enabled) {
        return false; // Closed if day is not enabled
      }

      const currentTime = now.getHours() * 60 + now.getMinutes(); // minutes since midnight
      const [openHour, openMin] = dayHours.open.split(':').map(Number);
      const [closeHour, closeMin] = dayHours.close.split(':').map(Number);
      const openTime = openHour * 60 + openMin;
      const closeTime = closeHour * 60 + closeMin;

      return currentTime >= openTime && currentTime < closeTime;
    } catch (error) {
      console.error('Error calculating isCafeOpen:', error);
      return true; // Default to open on error to avoid false negatives
    }
  }
}

