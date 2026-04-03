import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const siteConfig = {
  name: "AMOPARK",
  fullName: "Associação de Moradores do Bairro North Park",
  slogan: "Juntos Podemos Mais",
  description:
    "Canal oficial de transparência e comunicação da Associação de Moradores do Bairro North Park.",
  links: {
    whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_URL ?? "#",
    instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? "#",
    facebook: process.env.NEXT_PUBLIC_FACEBOOK_URL ?? "#",
    formContato: "/contato",
  },
} as const;
