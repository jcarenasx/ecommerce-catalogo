import { buildWhatsAppUrl } from "../lib/whatsapp";

const FALLBACK_MESSAGE = "Hola, reviso tu catálogo y tengo una duda.";

export default function WhatsAppContactButton() {
  const href = buildWhatsAppUrl(FALLBACK_MESSAGE);

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="fixed right-5 bottom-5 z-20 flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-emerald-600 sm:right-8 sm:bottom-8"
      aria-label="Contactar por WhatsApp"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
        viewBox="0 0 24 24"
        className="h-5 w-5"
        role="presentation"
      >
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.472-.148-.672.15-.198.297-.768.967-.942 1.164-.173.198-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.447-.521.15-.174.198-.298.298-.497.099-.198.05-.372-.025-.521-.075-.148-.672-1.612-.92-2.21-.242-.579-.487-.5-.672-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.709.306 1.262.488 1.693.626.712.226 1.36.194 1.872.118.571-.085 1.758-.718 2.006-1.41.248-.693.248-1.288.173-1.41-.074-.124-.272-.198-.57-.347z" />
        <path d="M12.004 2a10 10 0 00-8.872 14.76l-1.01 3.747 3.843-1.01A10 10 0 1012.004 2zm0 18.037a8.012 8.012 0 01-4.312-1.262l-.31-.194-2.282.6.607-2.246-.2-.322A7.987 7.987 0 014.01 12c0-4.41 3.59-8 8-8s8 3.59 8 8-3.59 8.037-8 8.037z" />
      </svg>
      WhatsApp
    </a>
  );
}
