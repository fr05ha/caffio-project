import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

const ohMatchaMenu = [
  { name: 'Matcha Soft Serve', description: 'Signature matcha soft serve.', price: 5.30, category: 'Dessert' },
  { name: 'Hokkaido Milk Soft Serve', description: 'Rich and creamy Hokkaido milk soft serve.', price: 5.30, category: 'Dessert' },
  { name: 'Genmai Tea Soft Serve', description: 'Roasted rice and green tea flavor.', price: 5.50, category: 'Dessert' },
  { name: 'Black Sesame Soft Serve', description: 'Rich in nutrients, beloved in Japan.', price: 5.50, category: 'Dessert' },
  { name: 'Mix Flavour Soft Serve', description: 'Current mix soft serve, ask staff.', price: 6.30, category: 'Dessert' },
  { name: 'Deluxe Soft Serve w/Warabi Mochi', description: 'Soft serve with red beans, matcha and kinako warabi mochi.', price: 10.20, category: 'Dessert' },
  { name: 'Mochi Float with Pearls', description: 'Drink and soft serve of your choice with pearls.', price: 10.50, category: 'Dessert' },
  { name: 'Matcha Parfait', description: 'Ultimate parfait for matcha lovers.', price: 17.80, category: 'Dessert' },
  { name: 'Strawberry Short Cake', description: 'With a soft serve of your choice.', price: 9.80, category: 'Dessert' },
  { name: 'Warabi Mochi Set', description: 'Warabi matcha, hojicha, kinako mochi with soft serve.', price: 9.80, category: 'Dessert' },
  { name: 'Ice Matcha Latte', description: 'Most popular cold beverage. Milk alternatives available.', price: 6.80, category: 'Drink' },
  { name: 'Hot Matcha Latte', description: 'Best of our hot beverages. Milk alternative available.', price: 5.80, category: 'Drink' },
  { name: 'Japanese Chips', description: 'Choose your seasoning: Soy Butter & Seaweed, Matcha Garlic, Chili & Garlic, Paprika, Salt.', price: 5.80, category: 'Food' },
  { name: 'Takoyaki', description: 'Japanese pancake balls with octopus inside.', price: 7.80, category: 'Food' },
  { name: 'Karaage Fried Chicken', description: 'Japanese style deep fried boneless chicken thigh. Original or spicy.', price: 10.80, category: 'Food' },
];

async function main() {
  // Check if Oh Matcha already exists
  let cafe = await db.cafe.findFirst({
    where: {
      OR: [
        { name: { contains: 'Oh Matcha', mode: 'insensitive' } },
        { address: { contains: '501 George', mode: 'insensitive' } },
      ],
    },
  });

  if (!cafe) {
    // Create Oh Matcha cafe
    cafe = await db.cafe.create({
      data: {
        name: 'Oh Matcha',
        address: 'Shop 11/501 George St, Sydney NSW 2000',
        lat: -33.8705,
        lon: 151.2070,
        ratingAvg: 4.8,
        ratingCount: 342,
        isCertified: true,
      },
    });
    console.log(`✅ Created cafe: ${cafe.name} (ID: ${cafe.id})`);
  } else {
    console.log(`ℹ️  Cafe already exists: ${cafe.name} (ID: ${cafe.id})`);
  }

  // Create or get menu
  let menu = await db.menu.findFirst({
    where: { cafeId: cafe.id, name: 'Main' },
  });

  if (!menu) {
    menu = await db.menu.create({
      data: {
        cafeId: cafe.id,
        name: 'Main',
        isActive: true,
      },
    });
    console.log(`✅ Created menu: ${menu.name} (ID: ${menu.id})`);
  } else {
    console.log(`ℹ️  Menu already exists: ${menu.name} (ID: ${menu.id})`);
  }

  // Add menu items
  let addedCount = 0;
  let skippedCount = 0;

  for (const item of ohMatchaMenu) {
    const existing = await db.menuItem.findFirst({
      where: {
        menuId: menu.id,
        name: item.name,
      },
    });

    if (!existing) {
      await db.menuItem.create({
        data: {
          menuId: menu.id,
          name: item.name,
          description: item.description,
          price: item.price,
          currency: 'AUD',
        },
      });
      addedCount++;
      console.log(`  ✅ Added: ${item.name} ($${item.price})`);
    } else {
      skippedCount++;
      console.log(`  ⏭️  Skipped (exists): ${item.name}`);
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   Added: ${addedCount} items`);
  console.log(`   Skipped: ${skippedCount} items`);
  console.log(`   Total in menu: ${ohMatchaMenu.length} items`);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());

