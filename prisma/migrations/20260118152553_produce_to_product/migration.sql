/*
  Warnings:

  - You are about to drop the column `produceId` on the `user_order` table. All the data in the column will be lost.
  - Added the required column `productId` to the `user_order` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "user_order" DROP CONSTRAINT "user_order_produceId_fkey";

-- DropIndex
DROP INDEX "user_order_userId_produceId_idx";

-- AlterTable
ALTER TABLE "user_order" DROP COLUMN "produceId",
ADD COLUMN     "productId" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "user_order_userId_productId_idx" ON "user_order"("userId", "productId");

-- AddForeignKey
ALTER TABLE "user_order" ADD CONSTRAINT "user_order_productId_fkey" FOREIGN KEY ("productId") REFERENCES "produce"("id") ON DELETE CASCADE ON UPDATE CASCADE;
