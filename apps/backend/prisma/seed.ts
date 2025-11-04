import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

async function main() {
  await db.cafe.createMany({
    data: [
      { name: 'Single O Surry Hills', address: 'Reservoir St, Surry Hills NSW', lat: -33.882, lon: 151.209, ratingAvg: 4.7, ratingCount: 241, isCertified: true },
      { name: 'Mecca Coffee King St', address: 'King St, Sydney NSW', lat: -33.871, lon: 151.207, ratingAvg: 4.6, ratingCount: 180 },
      { name: 'Reuben Hills', address: 'Albion St, Surry Hills NSW', lat: -33.8847, lon: 151.2113, ratingAvg: 4.65, ratingCount: 210, isCertified: true }
    ]
  });
}

main().finally(() => db.$disconnect());
