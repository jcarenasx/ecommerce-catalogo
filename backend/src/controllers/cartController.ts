import type { NextFunction, Request, Response } from "express";
import type { AuthedRequest } from "../auth.js";
import type { AddCartItemInput, UpdateCartItemInput } from "../middleware/validateCart.js";
import { cartService } from "../services/cartService.js";

type CartItemParams = {
  productModel: string;
};

type CartAddRequest = AuthedRequest & Request<Record<string, never>, unknown, AddCartItemInput>;
type CartUpdateRequest = AuthedRequest &
  Request<CartItemParams, unknown, UpdateCartItemInput>;
type CartRemoveRequest = AuthedRequest & Request<CartItemParams>;

export const cartController = {
  async list(req: AuthedRequest, res: Response, next: NextFunction) {
    try {
      const items = await cartService.list(req.auth!.userId);
      return res.json({ items });
    } catch (error) {
      next(error);
    }
  },

  async add(req: CartAddRequest, res: Response, next: NextFunction) {
    try {
      const item = await cartService.addItem(req.auth!.userId, req.body);
      return res.status(201).json({ item });
    } catch (error) {
      next(error);
    }
  },

  async update(req: CartUpdateRequest, res: Response, next: NextFunction) {
    try {
      const item = await cartService.updateItem(
        req.auth!.userId,
        req.params.productModel,
        req.body
      );
      return res.json({ item });
    } catch (error) {
      next(error);
    }
  },

  async remove(req: CartRemoveRequest, res: Response, next: NextFunction) {
    try {
      await cartService.removeItem(req.auth!.userId, req.params.productModel);
      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};
