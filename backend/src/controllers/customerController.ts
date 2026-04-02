import type { Request, Response, NextFunction } from "express";
import type { CreateCustomerInput } from "../middleware/validateCustomer.js";
import { customerService } from "../services/customerService.js";

type CustomerCreateRequest = Request<Record<string, never>, unknown, CreateCustomerInput>;

export const customerController = {
  async create(req: CustomerCreateRequest, res: Response, next: NextFunction) {
    try {
      const customer = await customerService.create(req.body);
      return res.status(201).json({ customer });
    } catch (error) {
      next(error);
    }
  },

  async list(_req: Request, res: Response, next: NextFunction) {
    try {
      const customers = await customerService.list();
      return res.json({ customers });
    } catch (error) {
      next(error);
    }
  },
};
