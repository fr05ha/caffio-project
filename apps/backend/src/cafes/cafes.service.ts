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
    profileImageUrl?: string;
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
        ...(data.profileImageUrl !== undefined && { profileImageUrl: data.profileImageUrl }),
      },
    });
  }

  isCafeOpen(businessHours: any): boolean {
    try {
      // Handle null, undefined, or empty values - default to open if not set
      // This is safer for existing cafes that may not have business hours configured
      if (!businessHours) {
        return true; // Open by default if business hours not configured
      }

      // Handle Prisma JSON type - it might be a string that needs parsing
      let hours = businessHours;
      if (typeof businessHours === 'string') {
        try {
          hours = JSON.parse(businessHours);
        } catch (e) {
          console.warn('Failed to parse businessHours JSON:', e);
          return true; // Open by default if parsing fails
        }
      }

      // Check if hours is an object (not null, not array, not primitive)
      if (typeof hours !== 'object' || hours === null || Array.isArray(hours)) {
        return true; // Open by default if invalid format
      }

      // Check if businessHours object is empty (no days configured)
      const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const hasAnyDay = dayNames.some(day => hours[day] && typeof hours[day] === 'object');
      if (!hasAnyDay) {
        return true; // Open by default if no days are configured
      }

      const now = new Date();
      const dayIndex = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
      const dayName = dayNames[dayIndex];
      const dayHours = hours[dayName];

      // If day is not configured, check if any other day is configured
      // If no days are configured at all, default to open
      if (!dayHours || typeof dayHours !== 'object') {
        // If this specific day is not configured, but other days are, assume closed for this day
        // But if no days are configured at all, default to open
        return !hasAnyDay; // Return true only if no days are configured at all
      }

      // Check if day is enabled
      if (dayHours.enabled !== true && dayHours.enabled !== 'true') {
        return false; // Closed if day is explicitly disabled
      }

      // Parse open and close times
      if (!dayHours.open || !dayHours.close) {
        return false; // Closed if times are missing
      }

      const currentTime = now.getHours() * 60 + now.getMinutes(); // minutes since midnight
      
      // Parse time strings (format: "HH:MM" or "H:MM")
      const parseTime = (timeStr: string): number => {
        const parts = timeStr.split(':');
        if (parts.length !== 2) {
          throw new Error(`Invalid time format: ${timeStr}`);
        }
        const hour = parseInt(parts[0], 10);
        const minute = parseInt(parts[1], 10);
        if (isNaN(hour) || isNaN(minute) || hour < 0 || hour > 23 || minute < 0 || minute > 59) {
          throw new Error(`Invalid time values: ${timeStr}`);
        }
        return hour * 60 + minute;
      };

      const openTime = parseTime(dayHours.open);
      const closeTime = parseTime(dayHours.close);

      // Check if current time is within business hours
      // Handle case where close time is next day (e.g., 22:00 to 02:00)
      if (closeTime < openTime) {
        // Business hours span midnight
        return currentTime >= openTime || currentTime < closeTime;
      } else {
        // Normal business hours (same day)
        return currentTime >= openTime && currentTime < closeTime;
      }
    } catch (error) {
      console.error('Error calculating isCafeOpen:', error, 'businessHours:', businessHours);
      return true; // Default to open on error to avoid false negatives
    }
  }
}

