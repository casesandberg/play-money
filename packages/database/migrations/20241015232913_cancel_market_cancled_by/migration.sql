-- AlterTable
ALTER TABLE "Market" ADD COLUMN     "canceledById" TEXT;

-- AddForeignKey
ALTER TABLE "Market" ADD CONSTRAINT "Market_canceledById_fkey" FOREIGN KEY ("canceledById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
