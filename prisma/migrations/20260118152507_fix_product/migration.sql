/*
  Warnings:

  - You are about to drop the column `itemId` on the `user_order` table. All the data in the column will be lost.
  - You are about to drop the `item` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `produceId` to the `user_order` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ProduceStatus" AS ENUM ('AVAILABLE', 'SOLD_OUT');

-- DropForeignKey
ALTER TABLE "item" DROP CONSTRAINT "item_userId_fkey";

-- DropForeignKey
ALTER TABLE "user_order" DROP CONSTRAINT "user_order_itemId_fkey";

-- DropIndex
DROP INDEX "user_order_userId_itemId_idx";

-- AlterTable
ALTER TABLE "user_order" DROP COLUMN "itemId",
ADD COLUMN     "produceId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "item";

-- DropEnum
DROP TYPE "ItemStatus";

-- CreateTable
CREATE TABLE "produce" (
    "id" SERIAL NOT NULL,
    "enName" TEXT NOT NULL,
    "arName" TEXT NOT NULL,
    "ckbName" TEXT NOT NULL,
    "enDesc" TEXT NOT NULL,
    "arDesc" TEXT NOT NULL,
    "ckbDesc" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "status" "ProduceStatus" NOT NULL DEFAULT 'AVAILABLE',
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "produce_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "produce_status_userId_idx" ON "produce"("status", "userId");

-- CreateIndex
CREATE INDEX "user_order_userId_produceId_idx" ON "user_order"("userId", "produceId");

-- AddForeignKey
ALTER TABLE "produce" ADD CONSTRAINT "produce_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_order" ADD CONSTRAINT "user_order_produceId_fkey" FOREIGN KEY ("produceId") REFERENCES "produce"("id") ON DELETE CASCADE ON UPDATE CASCADE;
