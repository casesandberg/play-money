-- AlterTable
ALTER TABLE "Market" ADD COLUMN     "commentCount" DECIMAL(65,30),
ADD COLUMN     "liquidityCount" DECIMAL(65,30),
ADD COLUMN     "uniquePromotersCount" DECIMAL(65,30),
ADD COLUMN     "uniqueTradersCount" DECIMAL(65,30);

-- AlterTable
ALTER TABLE "MarketOption" ADD COLUMN     "probability" DECIMAL(65,30);
