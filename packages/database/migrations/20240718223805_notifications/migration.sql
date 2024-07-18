-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('MARKET_RESOLVED', 'MARKET_TRADE', 'MARKET_LIQUIDITY_ADDED', 'MARKET_COMMENT', 'COMMENT_REPLY', 'COMMENT_MENTION', 'COMMENT_REACTION');

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "content" JSONB NOT NULL,
    "marketId" TEXT,
    "marketOptionId" TEXT,
    "marketResolutionId" TEXT,
    "transactionId" TEXT,
    "commentId" TEXT,
    "parentCommentId" TEXT,
    "commentReactionId" TEXT,
    "actionUrl" TEXT NOT NULL,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationGroup" (
    "id" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "lastNotificationId" TEXT NOT NULL,
    "groupWindowEnd" TIMESTAMP(3) NOT NULL,
    "groupKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationGroup_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Notification_recipientId_createdAt_idx" ON "Notification"("recipientId", "createdAt");

-- CreateIndex
CREATE INDEX "NotificationGroup_recipientId_type_groupWindowEnd_groupKey_idx" ON "NotificationGroup"("recipientId", "type", "groupWindowEnd", "groupKey");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationGroup_recipientId_type_groupWindowEnd_groupKey_key" ON "NotificationGroup"("recipientId", "type", "groupWindowEnd", "groupKey");

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "Market"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_marketOptionId_fkey" FOREIGN KEY ("marketOptionId") REFERENCES "MarketOption"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_marketResolutionId_fkey" FOREIGN KEY ("marketResolutionId") REFERENCES "MarketResolution"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_parentCommentId_fkey" FOREIGN KEY ("parentCommentId") REFERENCES "Comment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_commentReactionId_fkey" FOREIGN KEY ("commentReactionId") REFERENCES "CommentReaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationGroup" ADD CONSTRAINT "NotificationGroup_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationGroup" ADD CONSTRAINT "NotificationGroup_lastNotificationId_fkey" FOREIGN KEY ("lastNotificationId") REFERENCES "Notification"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
