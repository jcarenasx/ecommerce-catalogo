import { api } from "../lib/api";
import type { AvailabilityTag } from "../types";

export async function fetchAvailabilityTags(): Promise<AvailabilityTag[]> {
  const response = await api.get<{ tags: AvailabilityTag[] }>("/availability");
  return response.data.tags;
}

export async function createAvailabilityTag(name: string): Promise<AvailabilityTag> {
  const response = await api.post<{ tag: AvailabilityTag }>("/availability", { name });
  return response.data.tag;
}

export async function deleteAvailabilityTag(id: string): Promise<void> {
  await api.delete(`/availability/${id}`);
}
