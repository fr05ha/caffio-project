-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "customerId" INTEGER,
ADD COLUMN     "customerName" TEXT;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
