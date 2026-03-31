const DEFAULT_NUMBER = "525564934616";

function normalizeNumber(value: string | undefined): string {
  if (!value) return DEFAULT_NUMBER;
  return value.replace(/[^\d]/g, "");
}

export function getWhatsAppPhone(): string {
  return normalizeNumber(import.meta.env.VITE_WHATSAPP_NUMBER);
}

export function buildWhatsAppUrl(message: string): string {
  const phone = getWhatsAppPhone();
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${phone}?text=${encodedMessage}`;
}
