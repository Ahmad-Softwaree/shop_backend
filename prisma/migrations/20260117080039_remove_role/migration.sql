/*
  Warnings:

  - The `status` column on the `item` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `roleId` on the `user` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ItemStatus" AS ENUM ('AVAILABLE', 'SOLD_OUT');

-- AlterTable
ALTER TABLE "item" DROP COLUMN "status",
ADD COLUMN     "status" "ItemStatus" NOT NULL DEFAULT 'AVAILABLE';

-- AlterTable
ALTER TABLE "user" DROP COLUMN "roleId";

-- DropEnum
DROP TYPE "item_status";

-- CreateIndex
CREATE INDEX "item_status_userId_idx" ON "item"("status", "userId");
