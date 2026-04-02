import { prisma } from "../prisma.js";

export const availabilityTagRepository = {
  findAll() {
    return prisma.availabilityTag.findMany({
      orderBy: { name: "asc" },
    });
  },

  findById(id: string) {
    return prisma.availabilityTag.findUnique({
      where: { id },
    });
  },

  findByName(name: string) {
    return prisma.availabilityTag.findFirst({
      where: { name: { equals: name, mode: "insensitive" } },
    });
  },

  create(name: string) {
    return prisma.availabilityTag.create({
      data: { name },
    });
  },

  delete(id: string) {
    return prisma.availabilityTag.delete({
      where: { id },
    });
  },

  countProductsUsing(tagId: string) {
    return prisma.product.count({
      where: { availabilityTagId: tagId },
    });
  },
};
