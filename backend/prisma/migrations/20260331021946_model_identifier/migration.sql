/*
  Warnings:

  - A unique constraint covering the columns `[modelo]` on the table `Product` will be added. If there are existing duplicate values, this will fail.
  - Made the column `modelo` on table `Product` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "modelo" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Product_modelo_key" ON "Product"("modelo");
