/*
  Warnings:

  - Added the required column `slug` to the `List` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "List" ADD COLUMN     "slug" TEXT NOT NULL;
