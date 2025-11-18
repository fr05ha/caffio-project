-- DropForeignKey
ALTER TABLE "public"."CustomerFavoriteCafe" DROP CONSTRAINT "CustomerFavoriteCafe_cafeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."CustomerFavoriteCafe" DROP CONSTRAINT "CustomerFavoriteCafe_customerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."CustomerFavoriteMenuItem" DROP CONSTRAINT "CustomerFavoriteMenuItem_customerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."CustomerFavoriteMenuItem" DROP CONSTRAINT "CustomerFavoriteMenuItem_menuItemId_fkey";

-- AddForeignKey
ALTER TABLE "CustomerFavoriteCafe" ADD CONSTRAINT "CustomerFavoriteCafe_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerFavoriteCafe" ADD CONSTRAINT "CustomerFavoriteCafe_cafeId_fkey" FOREIGN KEY ("cafeId") REFERENCES "Cafe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerFavoriteMenuItem" ADD CONSTRAINT "CustomerFavoriteMenuItem_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerFavoriteMenuItem" ADD CONSTRAINT "CustomerFavoriteMenuItem_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "MenuItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
