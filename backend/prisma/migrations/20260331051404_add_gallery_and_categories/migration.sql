-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "categoria" TEXT,
ADD COLUMN     "gallery" TEXT[] DEFAULT ARRAY[]::TEXT[];
