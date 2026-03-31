/*
  Warnings:

  - You are about to drop the column `gallery` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl` on the `Product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "gallery",
DROP COLUMN "imageUrl",
ADD COLUMN     "images" TEXT[] DEFAULT ARRAY[]::TEXT[];
