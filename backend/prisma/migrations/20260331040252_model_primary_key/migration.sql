/*
  Warnings:

  - You are about to drop the column `productSku` on the `CartItem` table. All the data in the column will be lost.
  - The primary key for the `Product` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[userId,productModel]` on the table `CartItem` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `productModel` to the `CartItem` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "CartItem" DROP CONSTRAINT "CartItem_productSku_fkey";

-- DropIndex
DROP INDEX "CartItem_userId_productSku_key";

-- DropIndex
DROP INDEX "Product_modelo_key";

-- AlterTable
ALTER TABLE "CartItem" DROP COLUMN "productSku",
ADD COLUMN     "productModel" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Product" DROP CONSTRAINT "Product_pkey",
ALTER COLUMN "sku" DROP NOT NULL,
ADD CONSTRAINT "Product_pkey" PRIMARY KEY ("modelo");

-- CreateIndex
CREATE UNIQUE INDEX "CartItem_userId_productModel_key" ON "CartItem"("userId", "productModel");

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_productModel_fkey" FOREIGN KEY ("productModel") REFERENCES "Product"("modelo") ON DELETE CASCADE ON UPDATE CASCADE;
