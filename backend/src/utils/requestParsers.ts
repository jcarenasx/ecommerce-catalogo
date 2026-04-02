export function getFirstParam(value: unknown): string {
  if (Array.isArray(value)) {
    const candidate = value[0];
    return typeof candidate === "string" ? candidate : "";
  }

  return typeof value === "string" ? value : "";
}

export function parseBooleanQuery(value: unknown): boolean {
  if (typeof value === "string") {
    return value === "true" || value === "1";
  }

  if (Array.isArray(value)) {
    const firstValue = value[0];
    return typeof firstValue === "string" && (firstValue === "true" || firstValue === "1");
  }

  return false;
}

export function parseNumberQuery(value: unknown, fallback?: number): number | undefined {
  if (!value) {
    return fallback;
  }

  const candidate = Array.isArray(value) ? value[0] : value;
  const parsed = Number(candidate);
  if (Number.isNaN(parsed) || parsed < 0) {
    return fallback;
  }

  return parsed;
}
