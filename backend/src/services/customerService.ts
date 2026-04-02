import type { CreateCustomerInput } from "../middleware/validateCustomer.js";
import { customerRepository } from "../repositories/customerRepository.js";

export const customerService = {
  async create(input: CreateCustomerInput) {
    return customerRepository.create(input);
  },

  list() {
    return customerRepository.findAll();
  },
};
