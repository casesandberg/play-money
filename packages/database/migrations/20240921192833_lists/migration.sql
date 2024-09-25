-- CreateEnum
CREATE TYPE "QuestionContributionPolicy" AS ENUM ('DISABLED', 'OWNERS_ONLY', 'FRIENDS_ONLY', 'PUBLIC');

-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "listId" TEXT;

-- AlterTable
ALTER TABLE "Market" ADD COLUMN     "parentListId" TEXT;

-- CreateTable
CREATE TABLE "List" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "ownerId" TEXT NOT NULL,
    "contributionPolicy" "QuestionContributionPolicy" NOT NULL DEFAULT 'OWNERS_ONLY',
    "contributionReview" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "List_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketList" (
    "id" TEXT NOT NULL,
    "listId" TEXT NOT NULL,
    "marketId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MarketList_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "List_ownerId_idx" ON "List"("ownerId");

-- CreateIndex
CREATE INDEX "MarketList_listId_idx" ON "MarketList"("listId");

-- CreateIndex
CREATE INDEX "MarketList_marketId_idx" ON "MarketList"("marketId");

-- CreateIndex
CREATE UNIQUE INDEX "MarketList_listId_marketId_key" ON "MarketList"("listId", "marketId");

-- AddForeignKey
ALTER TABLE "Market" ADD CONSTRAINT "Market_parentListId_fkey" FOREIGN KEY ("parentListId") REFERENCES "List"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_listId_fkey" FOREIGN KEY ("listId") REFERENCES "List"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "List" ADD CONSTRAINT "List_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketList" ADD CONSTRAINT "MarketList_listId_fkey" FOREIGN KEY ("listId") REFERENCES "List"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketList" ADD CONSTRAINT "MarketList_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "Market"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
