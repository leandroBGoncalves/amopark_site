/** Rótulo no menu — moradores buscam "ofícios", não "transparência". */
export const OFICIOS_NAV_LABEL = "Ofícios";

/** WhatsApp oficial da AMOPARK (+55 67 99254-3306). */
export const WHATSAPP_PHONE_DISPLAY = "+55 (67) 99254-3306";
export const WHATSAPP_URL = "https://wa.me/5567992543306";

/** Slug do evento da Festa Julina no admin (Eventos). Sobrescreva via env se mudar a cada ano. */
export const FESTA_JULINA_EVENT_SLUG =
  process.env.NEXT_PUBLIC_FESTA_JULINA_EVENT_SLUG ?? "festa-julina";

export const ROUTES = {
  home: "/",
  /** URL canônica do mural; `/oficios` redireciona para aqui. */
  transparencia: "/transparencia",
  oficios: "/oficios",
  eventos: "/eventos",
  festaJulina: "/festa-julina",
  parceiros: "/parceiros",
  noticias: "/noticias",
  contato: "/contato",
  faleConosco: "/fale-conosco",
  privacidade: "/privacidade",
  admin: "/admin",
} as const;

export const COOKIE_CONSENT_KEY = "amopark-cookie-consent";
