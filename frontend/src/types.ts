export type UserRole = "USER" | "ADMIN";
export type OrderStatus =
  | "PENDING"
  | "PAID"
  | "SHIPPED"
  | "COMPLETED"
  | "CANCELLED";

export type User = {
  id: string;
  email: string;
  name: string | null;
  phone?: string | null;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
};

export type Product = {
  name: string;
  size: string | null;
  color: string | null;
  model: string;
  sku: string | null;
  category: string | null;
  brand: string | null;
  images: string[];
  priceCents: number | null;
  paymentLinkWithShipping: string | null;
  paymentLinkWithoutShipping: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ProductInput = {
  name: string;
  size?: string | null;
  color?: string | null;
  model: string;
  sku?: string | null;
  category?: string | null;
  brand?: string | null;
  images?: string[];
  priceCents?: number | null;
  paymentLinkWithShipping?: string | null;
  paymentLinkWithoutShipping?: string | null;
  active?: boolean;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type RegisterInput = {
  email: string;
  password: string;
  name?: string;
};
