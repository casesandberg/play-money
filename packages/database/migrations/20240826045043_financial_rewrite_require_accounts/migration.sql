/*
  Warnings:

  - Made the column `ammAccountId` on table `Market` required. This step will fail if there are existing NULL values in that column.
  - Made the column `clearingAccountId` on table `Market` required. This step will fail if there are existing NULL values in that column.
  - Made the column `primaryAccountId` on table `User` required. This step will fail if there are existing NULL values in that column.

*/

-- Create a function to generate CUID-like identifiers
CREATE OR REPLACE FUNCTION generate_cuid() RETURNS TEXT AS $$
DECLARE
    timestamp TEXT;
    counter TEXT;
    random TEXT;
BEGIN
    timestamp := LPAD(TO_HEX(EXTRACT(EPOCH FROM CURRENT_TIMESTAMP)::BIGINT), 8, '0');
    counter := LPAD(TO_HEX((RANDOM() * 1073741824)::INT), 4, '0');
    random := LPAD(TO_HEX((RANDOM() * 9007199254740991)::BIGINT), 12, '0');
    RETURN CONCAT('c', timestamp, counter, random);
END;
$$ LANGUAGE plpgsql;

-- Step 1: Create HOUSE account
INSERT INTO "Account" ("id", "type", "internalType", "createdAt", "updatedAt")
SELECT generate_cuid(), 'HOUSE', 'HOUSE', NOW(), NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM "Account" WHERE "type" = 'HOUSE' AND "internalType" = 'HOUSE'
);

-- Step 2: Create AMM and Clearing accounts for each market
INSERT INTO "Account" ("id", "type", "marketId", "createdAt", "updatedAt")
SELECT 
    generate_cuid(), 
    'MARKET_AMM', 
    "id", 
    NOW(), 
    NOW()
FROM "Market"
WHERE "ammAccountId" IS NULL;

UPDATE "Market" m
SET "ammAccountId" = a."id"
FROM "Account" a
WHERE m."id" = a."marketId" AND a."type" = 'MARKET_AMM';

INSERT INTO "Account" ("id", "type", "marketId", "createdAt", "updatedAt")
SELECT 
    generate_cuid(), 
    'MARKET_CLEARING', 
    "id", 
    NOW(), 
    NOW()
FROM "Market"
WHERE "clearingAccountId" IS NULL;

UPDATE "Market" m
SET "clearingAccountId" = a."id"
FROM "Account" a
WHERE m."id" = a."marketId" AND a."type" = 'MARKET_CLEARING';

-- Step 3: Create primary accounts for each user
INSERT INTO "Account" ("id", "type", "userId", "createdAt", "updatedAt")
SELECT 
    generate_cuid(), 
    'USER', 
    "id", 
    NOW(), 
    NOW()
FROM "User"
WHERE "primaryAccountId" IS NULL;

UPDATE "User" u
SET "primaryAccountId" = a."id"
FROM "Account" a
WHERE u."id" = a."userId" AND a."type" = 'USER';


-- DropForeignKey
ALTER TABLE "Market" DROP CONSTRAINT "Market_ammAccountId_fkey";

-- DropForeignKey
ALTER TABLE "Market" DROP CONSTRAINT "Market_clearingAccountId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_primaryAccountId_fkey";

-- AlterTable
ALTER TABLE "Market" ALTER COLUMN "ammAccountId" SET NOT NULL,
ALTER COLUMN "clearingAccountId" SET NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "primaryAccountId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_primaryAccountId_fkey" FOREIGN KEY ("primaryAccountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Market" ADD CONSTRAINT "Market_ammAccountId_fkey" FOREIGN KEY ("ammAccountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Market" ADD CONSTRAINT "Market_clearingAccountId_fkey" FOREIGN KEY ("clearingAccountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
