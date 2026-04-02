import { HttpError } from "../utils/httpError.js";
import { cartRepository, type CartItemWithProduct } from "../repositories/cartRepository.js";
import { productRepository } from "../repositories/productRepository.js";
import type { AddCartItemInput, UpdateCartItemInput } from "../middleware/validateCart.js";

function sanitizeProductModel(value: string | undefined): string {
  const trimmed = value?.trim();
  if (!trimmed) {
    throw new HttpError(400, "INVALID_PRODUCT_MODEL", "El modelo proporcionado es inválido.");
  }
  return trimmed;
}

export const cartService = {
  list(userId: string): Promise<CartItemWithProduct[]> {
    return cartRepository.listByUser(userId);
  },

  async addItem(userId: string, input: AddCartItemInput): Promise<CartItemWithProduct> {
    const model = sanitizeProductModel(input.productModel);
    const product = await productRepository.findUnique(model);
    if (!product) {
      throw new HttpError(404, "PRODUCT_NOT_FOUND", "El producto especificado no existe.");
    }

    const existing = await cartRepository.findItem(userId, model);
    if (existing) {
      return cartRepository.updateQuantity(userId, model, existing.quantity + input.quantity);
    }

    return cartRepository.create({
      userId,
      productModel: model,
      quantity: input.quantity,
    });
  },

  async updateItem(
    userId: string,
    productModel: string | undefined,
    payload: UpdateCartItemInput
  ): Promise<CartItemWithProduct> {
    const model = sanitizeProductModel(productModel);
    const existing = await cartRepository.findItem(userId, model);
    if (!existing) {
      throw new HttpError(404, "CART_ITEM_NOT_FOUND", "El ítem no está en el carrito.");
    }

    return cartRepository.updateQuantity(userId, model, payload.quantity);
  },

  async removeItem(userId: string, productModel: string | undefined): Promise<void> {
    const model = sanitizeProductModel(productModel);
    const existing = await cartRepository.findItem(userId, model);
    if (!existing) {
      throw new HttpError(404, "CART_ITEM_NOT_FOUND", "El ítem no está en el carrito.");
    }

    await cartRepository.delete(userId, model);
  },
};
