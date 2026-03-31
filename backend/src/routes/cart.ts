import { Router } from "express";
import type { Request, Response } from "express";
import { z } from "zod";
import type { AuthedRequest } from "../auth";
import { requireAuth } from "../middleware/requireAuth";
import { prisma } from "../prisma";

const router = Router();

const addCartItemSchema = z.object({
  productModel: z.string().trim().min(1),
  quantity: z.number().int().positive().default(1),
});

const updateCartItemSchema = z.object({
  quantity: z.number().int().positive(),
});

type CartItemParams = {
  productModel: string;
};

router.use(requireAuth);

router.get("/", async (req: AuthedRequest, res: Response) => {
  const items = await prisma.cartItem.findMany({
    where: { userId: req.auth!.userId },
    include: { product: true },
    orderBy: { createdAt: "asc" },
  });

  return res.json({ items });
});

router.post("/", async (req: AuthedRequest, res: Response) => {
  const parsed = addCartItemSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: "INVALID_BODY",
      details: parsed.error.flatten(),
    });
  }

  const { productModel, quantity } = parsed.data;
  const product = await prisma.product.findUnique({
    where: { model: productModel },
  });

  if (!product) {
    return res.status(404).json({ error: "PRODUCT_NOT_FOUND" });
  }

  const item = await prisma.cartItem.upsert({
    where: {
      userId_productModel: {
        userId: req.auth!.userId,
        productModel,
      },
    },
    update: {
      quantity: { increment: quantity },
    },
    create: {
      userId: req.auth!.userId,
      productModel,
      quantity,
    },
    include: { product: true },
  });

  return res.status(201).json({ item });
});

router.put(
  "/:productModel",
  async (
    req: AuthedRequest & Request<CartItemParams>,
    res: Response
  ) => {
    const productModel = req.params.productModel?.trim();
    if (!productModel) {
      return res.status(400).json({ error: "INVALID_PRODUCT_MODEL" });
    }

    const parsed = updateCartItemSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: "INVALID_BODY",
        details: parsed.error.flatten(),
      });
    }

    const existingItem = await prisma.cartItem.findUnique({
      where: {
        userId_productModel: {
          userId: req.auth!.userId,
          productModel,
        },
      },
    });

    if (!existingItem) {
      return res.status(404).json({ error: "CART_ITEM_NOT_FOUND" });
    }

    const item = await prisma.cartItem.update({
      where: {
        userId_productModel: {
          userId: req.auth!.userId,
          productModel,
        },
      },
      data: {
        quantity: parsed.data.quantity,
      },
      include: { product: true },
    });

    return res.json({ item });
  }
);

router.delete(
  "/:productModel",
  async (
    req: AuthedRequest & Request<CartItemParams>,
    res: Response
  ) => {
    const productModel = req.params.productModel?.trim();
    if (!productModel) {
      return res.status(400).json({ error: "INVALID_PRODUCT_MODEL" });
    }

    const existingItem = await prisma.cartItem.findUnique({
      where: {
        userId_productModel: {
          userId: req.auth!.userId,
          productModel,
        },
      },
    });

    if (!existingItem) {
      return res.status(404).json({ error: "CART_ITEM_NOT_FOUND" });
    }

    await prisma.cartItem.delete({
      where: {
        userId_productModel: {
          userId: req.auth!.userId,
          productModel,
        },
      },
    });

    return res.status(204).send();
  }
);

export default router;
