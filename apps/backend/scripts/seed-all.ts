/**
 * Объединённый скрипт для сидирования всех данных
 * Использование:
 *   DATABASE_URL="postgresql://..." npx ts-node scripts/seed-all.ts
 * 
 * Или локально с .env:
 *   npx ts-node scripts/seed-all.ts
 */

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const db = new PrismaClient();

async function seedAll() {
  console.log('🌱 Starting full database seeding...\n');

  try {
    // 1. Сидирование базовых кафе (если их нет)
    console.log('📦 Step 1: Seeding cafes...');
    const existingCafes = await db.cafe.count();
    if (existingCafes === 0) {
      await db.cafe.createMany({
        data: [
          { name: 'Single O Surry Hills', address: 'Reservoir St, Surry Hills NSW', lat: -33.882, lon: 151.209, ratingAvg: 4.7, ratingCount: 241, isCertified: true },
          { name: 'Mecca Coffee King St', address: 'King St, Sydney NSW', lat: -33.871, lon: 151.207, ratingAvg: 4.6, ratingCount: 180 },
          { name: 'Reuben Hills', address: 'Albion St, Surry Hills NSW', lat: -33.8847, lon: 151.2113, ratingAvg: 4.65, ratingCount: 210, isCertified: true }
        ]
      });
      console.log('✅ Cafes created');
    } else {
      console.log(`⏭️  ${existingCafes} cafes already exist, skipping`);
    }

    // 2. Добавление Oh Matcha (если нет)
    console.log('\n📦 Step 2: Adding Oh Matcha cafe...');
    let ohMatcha = await db.cafe.findFirst({ where: { name: 'Oh Matcha' } });
    if (!ohMatcha) {
      ohMatcha = await db.cafe.create({
        data: {
          name: 'Oh Matcha',
          address: 'Shop 11/501 George St, Sydney NSW 2000',
          lat: -33.8705,
          lon: 151.2070,
          ratingAvg: 4.8,
          ratingCount: 156,
          isCertified: true,
        },
      });

      const ohMatchaMenu = [
        { name: 'Matcha Soft Serve', description: 'Signature matcha soft serve.', price: 5.30, category: 'Dessert' },
        { name: 'Matcha Latte', description: 'Creamy matcha with steamed milk.', price: 5.50, category: 'Drinks' },
        { name: 'Iced Matcha', description: 'Refreshing iced matcha.', price: 5.00, category: 'Drinks' },
        { name: 'Matcha Affogato', description: 'Matcha soft serve with espresso shot.', price: 6.50, category: 'Dessert' },
        { name: 'Matcha Frappe', description: 'Blended matcha frappe.', price: 6.00, category: 'Drinks' },
      ];

      await db.menu.create({
        data: {
          cafeId: ohMatcha.id,
          name: 'Main',
          items: {
            create: ohMatchaMenu.map(item => ({
              name: item.name,
              description: item.description,
              price: item.price,
              currency: 'AUD',
            })),
          },
        },
      });
      console.log('✅ Oh Matcha cafe and menu created');
    } else {
      console.log('⏭️  Oh Matcha already exists, skipping');
    }

    // 3. Установка тем для кафе
    console.log('\n📦 Step 3: Setting cafe themes...');
    const themes = {
      'Mecca Coffee King St': {
        theme: 'brown',
        primaryColor: '#8B4513',
        secondaryColor: '#D2691E',
        accentColor: '#CD853F',
      },
      'Reuben Hills': {
        theme: 'green',
        primaryColor: '#2C5530',
        secondaryColor: '#4A7C59',
        accentColor: '#6B9F7A',
      },
      'Oh Matcha': {
        theme: 'matcha',
        primaryColor: '#2D5016',
        secondaryColor: '#4A7C3E',
        accentColor: '#7CB342',
      },
    };

    for (const cafeName in themes) {
      const themeData = themes[cafeName as keyof typeof themes];
      await db.cafe.updateMany({
        where: { name: cafeName },
        data: themeData,
      });
    }
    console.log('✅ Cafe themes updated');

    // 4. Создание admin аккаунтов
    console.log('\n📦 Step 4: Creating admin accounts...');
    const adminAccounts = [
      {
        email: 'admin1@caffio.com',
        password: 'Admin123!',
        cafeName: 'Mecca Coffee King St',
      },
      {
        email: 'admin2@caffio.com',
        password: 'Admin456!',
        cafeName: 'Reuben Hills',
      },
      {
        email: 'admin3@caffio.com',
        password: 'Admin789!',
        cafeName: 'Oh Matcha',
      },
    ];

    for (const account of adminAccounts) {
      const cafe = await db.cafe.findFirst({ where: { name: account.cafeName } });
      if (!cafe) {
        console.log(`⚠️  Cafe "${account.cafeName}" not found, skipping admin account`);
        continue;
      }

      const existingUser = await db.user.findUnique({ where: { email: account.email } });
      if (existingUser) {
        console.log(`⏭️  Admin ${account.email} already exists, skipping`);
        continue;
      }

      const passwordHash = await bcrypt.hash(account.password, 10);
      await db.user.create({
        data: {
          email: account.email,
          passwordHash,
          cafeId: cafe.id,
        },
      });
      console.log(`✅ Created admin: ${account.email} for ${account.cafeName}`);
    }

    console.log('\n🎉 Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  } finally {
    await db.$disconnect();
  }
}

seedAll();

