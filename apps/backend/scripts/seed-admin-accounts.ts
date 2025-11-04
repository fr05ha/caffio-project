import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const db = new PrismaClient();

const adminAccounts = [
  {
    email: 'admin1@caffio.com',
    password: 'Admin123!',
    cafeId: 2, // Mecca Coffee King St
  },
  {
    email: 'admin2@caffio.com',
    password: 'Admin456!',
    cafeId: 3, // Reuben Hills
  },
  {
    email: 'admin3@caffio.com',
    password: 'Admin789!',
    cafeId: 4, // Oh Matcha
  },
];

async function main() {
  console.log('🔐 Creating admin accounts...\n');

  for (const account of adminAccounts) {
    // Check if cafe exists
    const cafe = await db.cafe.findUnique({
      where: { id: account.cafeId },
    });

    if (!cafe) {
      console.log(`❌ Cafe ID ${account.cafeId} not found, skipping...`);
      continue;
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: account.email },
    });

    if (existingUser) {
      console.log(`⏭️  Account already exists: ${account.email} (Cafe: ${cafe.name})`);
      continue;
    }

    // Hash password
    const passwordHash = await bcrypt.hash(account.password, 10);

    // Create user
    const user = await db.user.create({
      data: {
        email: account.email,
        passwordHash,
        cafeId: account.cafeId,
      },
      include: { cafe: true },
    });

    console.log(`✅ Created account: ${account.email}`);
    console.log(`   Password: ${account.password}`);
    console.log(`   Cafe: ${user.cafe.name} (ID: ${user.cafe.id})`);
    console.log('');
  }

  console.log('📊 Summary:');
  const allUsers = await db.user.findMany({
    include: { cafe: true },
  });
  console.log(`   Total accounts: ${allUsers.length}`);
  allUsers.forEach((user) => {
    console.log(`   - ${user.email} → ${user.cafe.name}`);
  });
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());



