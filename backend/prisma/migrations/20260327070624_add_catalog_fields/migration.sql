-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "color" TEXT,
ADD COLUMN     "modelo" TEXT,
ADD COLUMN     "paymentLinkWithShipping" TEXT,
ADD COLUMN     "paymentLinkWithoutShipping" TEXT,
ADD COLUMN     "sku" TEXT,
ADD COLUMN     "talla" TEXT,
ALTER COLUMN "priceCents" DROP NOT NULL;
