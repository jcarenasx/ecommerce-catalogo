/*
  Warnings:

  - You are about to drop the column `productId` on the `CartItem` table. All the data in the column will be lost.
  - The primary key for the `Product` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Product` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,productSku]` on the table `CartItem` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `productSku` to the `CartItem` table without a default value. This is not possible if the table is not empty.
  - Made the column `sku` on table `Product` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "CartItem" DROP CONSTRAINT "CartItem_productId_fkey";

-- DropIndex
DROP INDEX "CartItem_userId_productId_key";

-- AlterTable
ALTER TABLE "CartItem" DROP COLUMN "productId",
ADD COLUMN     "productSku" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Product" DROP CONSTRAINT "Product_pkey",
DROP COLUMN "id",
ALTER COLUMN "sku" SET NOT NULL,
ADD CONSTRAINT "Product_pkey" PRIMARY KEY ("sku");

-- CreateIndex
CREATE UNIQUE INDEX "CartItem_userId_productSku_key" ON "CartItem"("userId", "productSku");

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_productSku_fkey" FOREIGN KEY ("productSku") REFERENCES "Product"("sku") ON DELETE CASCADE ON UPDATE CASCADE;
