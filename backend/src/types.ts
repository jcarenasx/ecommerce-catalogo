import type {
  Product as PrismaProduct,
  User as PrismaUser,
} from "@prisma/client";

export type User = PrismaUser;
export type Product = PrismaProduct;
export type PublicUser = Omit<User, "passwordHash">;

export type ProductInput = {
  name?: string | null;
  size?: string | null;
  color?: string | null;
  model: string;
  sku?: string | null;
  category?: string | null;
  brand?: string | null;
  images?: string[] | null;
  priceCents?: number | null;
  paymentLinkWithShipping?: string | null;
  paymentLinkWithoutShipping?: string | null;
  active?: boolean;
};
