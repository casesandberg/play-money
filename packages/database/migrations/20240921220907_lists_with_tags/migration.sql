-- AlterTable
ALTER TABLE "List" ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];
