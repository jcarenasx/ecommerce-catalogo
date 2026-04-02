import type { CartItem } from "@prisma/client";
import { prisma } from "../prisma.js";
import type { Product } from "../types.js";

const cartItemInclude = { product: true } as const;

export type CartItemWithProduct = CartItem & { product: Product };

export const cartRepository = {
  listByUser(userId: string): Promise<CartItemWithProduct[]> {
    return prisma.cartItem.findMany({
      where: { userId },
      include: cartItemInclude,
      orderBy: { createdAt: "asc" },
    });
  },

  findItem(userId: string, productModel: string): Promise<CartItemWithProduct | null> {
    return prisma.cartItem.findUnique({
      where: { userId_productModel: { userId, productModel } },
      include: cartItemInclude,
    });
  },

  create(data: { userId: string; productModel: string; quantity: number }): Promise<CartItemWithProduct> {
    return prisma.cartItem.create({
      data,
      include: cartItemInclude,
    });
  },

  updateQuantity(
    userId: string,
    productModel: string,
    quantity: number
  ): Promise<CartItemWithProduct> {
    return prisma.cartItem.update({
      where: { userId_productModel: { userId, productModel } },
      data: { quantity },
      include: cartItemInclude,
    });
  },

  delete(userId: string, productModel: string) {
    return prisma.cartItem.delete({
      where: { userId_productModel: { userId, productModel } },
    });
  },
};
