/*
  Warnings:

  - You are about to drop the column `listId` on the `Comment` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "CommentEntityType" ADD VALUE 'LIST';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'LIST_COMMENT';
ALTER TYPE "NotificationType" ADD VALUE 'LIST_MARKET_ADDED';

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_listId_fkey";

-- AlterTable
ALTER TABLE "Comment" DROP COLUMN "listId";
