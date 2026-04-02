import { availabilityTagRepository } from "../repositories/availabilityTagRepository.js";
import { HttpError } from "../utils/httpError.js";

function normalizeName(value: string): string {
  return value.trim();
}

export const availabilityTagService = {
  list() {
    return availabilityTagRepository.findAll();
  },

  async create(name: string) {
    const normalized = normalizeName(name);
    if (!normalized) {
      throw new HttpError(400, "INVALID_NAME", "El nombre de la etiqueta no puede estar vacío.");
    }

    const existing = await availabilityTagRepository.findByName(normalized);
    if (existing) {
      throw new HttpError(409, "AVAILABILITY_TAG_EXISTS", "Ya existe una etiqueta con ese nombre.");
    }

    return availabilityTagRepository.create(normalized);
  },

  async remove(id: string) {
    const tag = await availabilityTagRepository.findById(id);
    if (!tag) {
      throw new HttpError(404, "AVAILABILITY_TAG_NOT_FOUND", "No se encontró la etiqueta solicitada.");
    }

    const usage = await availabilityTagRepository.countProductsUsing(id);
    if (usage > 0) {
      throw new HttpError(
        409,
        "AVAILABILITY_TAG_IN_USE",
        "La etiqueta está asignada a productos activos."
      );
    }

    return availabilityTagRepository.delete(id);
  },
};
