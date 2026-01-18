/*
  Warnings:

  - Added the required column `phone` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "item_status" AS ENUM ('available', 'sold');

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "phone" TEXT NOT NULL,
ADD COLUMN     "twoFactorAuthEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "twoFactorAuthSecret" TEXT;

-- CreateTable
CREATE TABLE "password_reset" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "token" TEXT NOT NULL,
    "tokenExpiry" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "item" (
    "id" SERIAL NOT NULL,
    "enName" TEXT NOT NULL,
    "arName" TEXT NOT NULL,
    "ckbName" TEXT NOT NULL,
    "enDesc" TEXT NOT NULL,
    "arDesc" TEXT NOT NULL,
    "ckbDesc" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "status" "item_status" NOT NULL DEFAULT 'available',
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_order" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "itemId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_order_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_userId_key" ON "password_reset"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_token_key" ON "password_reset"("token");

-- CreateIndex
CREATE INDEX "item_status_userId_idx" ON "item"("status", "userId");

-- CreateIndex
CREATE INDEX "user_order_userId_itemId_idx" ON "user_order"("userId", "itemId");

-- AddForeignKey
ALTER TABLE "password_reset" ADD CONSTRAINT "password_reset_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item" ADD CONSTRAINT "item_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_order" ADD CONSTRAINT "user_order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_order" ADD CONSTRAINT "user_order_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "item"("id") ON DELETE CASCADE ON UPDATE CASCADE;
