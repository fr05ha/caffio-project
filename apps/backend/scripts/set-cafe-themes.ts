import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

// Different themes for each cafe
const cafeThemes = [
  {
    cafeId: 2, // Mecca Coffee King St
    primaryColor: '#8B4513', // Saddle brown
    secondaryColor: '#D2691E', // Chocolate
    accentColor: '#CD853F', // Peru
    theme: 'brown',
    logoUrl: null,
  },
  {
    cafeId: 3, // Reuben Hills
    primaryColor: '#2C5530', // Forest green
    secondaryColor: '#4A7C59', // Medium sea green
    accentColor: '#6B9F7A', // Sage green
    theme: 'green',
    logoUrl: null,
  },
  {
    cafeId: 4, // Oh Matcha
    primaryColor: '#2D5016', // Dark green (matcha)
    secondaryColor: '#4A7C3E', // Matcha green
    accentColor: '#7CB342', // Light green
    theme: 'matcha',
    logoUrl: null,
  },
];

async function main() {
  console.log('🎨 Setting up cafe themes...\n');

  for (const theme of cafeThemes) {
    const cafe = await db.cafe.findUnique({
      where: { id: theme.cafeId },
    });

    if (!cafe) {
      console.log(`❌ Cafe ID ${theme.cafeId} not found, skipping...`);
      continue;
    }

    await db.cafe.update({
      where: { id: theme.cafeId },
      data: {
        primaryColor: theme.primaryColor,
        secondaryColor: theme.secondaryColor,
        accentColor: theme.accentColor,
        theme: theme.theme,
        logoUrl: theme.logoUrl,
      },
    });

    console.log(`✅ Updated theme for: ${cafe.name}`);
    console.log(`   Theme: ${theme.theme}`);
    console.log(`   Primary: ${theme.primaryColor}`);
    console.log(`   Secondary: ${theme.secondaryColor}`);
    console.log(`   Accent: ${theme.accentColor}`);
    console.log('');
  }

  console.log('📊 Summary:');
  const cafes = await db.cafe.findMany({
    where: { id: { in: cafeThemes.map(t => t.cafeId) } },
    select: { id: true, name: true, theme: true, primaryColor: true },
  });
  cafes.forEach((cafe) => {
    console.log(`   ${cafe.name} → ${cafe.theme} (${cafe.primaryColor})`);
  });
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());


