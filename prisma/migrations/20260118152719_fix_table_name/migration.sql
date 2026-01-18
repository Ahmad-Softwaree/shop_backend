/*
  Warnings:

  - You are about to drop the `produce` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "produce" DROP CONSTRAINT "produce_userId_fkey";

-- DropForeignKey
ALTER TABLE "user_order" DROP CONSTRAINT "user_order_productId_fkey";

-- DropTable
DROP TABLE "produce";

-- CreateTable
CREATE TABLE "product" (
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

    CONSTRAINT "product_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "product_status_userId_idx" ON "product"("status", "userId");

-- AddForeignKey
ALTER TABLE "product" ADD CONSTRAINT "product_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_order" ADD CONSTRAINT "user_order_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
