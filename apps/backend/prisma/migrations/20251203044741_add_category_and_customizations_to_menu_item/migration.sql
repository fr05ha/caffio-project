-- AlterTable
ALTER TABLE "MenuItem" ADD COLUMN     "category" TEXT NOT NULL DEFAULT 'Coffee',
ADD COLUMN     "customizations" JSONB;
