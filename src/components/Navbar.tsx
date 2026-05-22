"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { OFICIOS_NAV_LABEL, ROUTES } from "@/lib/constants";
import { siteConfig } from "@/lib/utils";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Início", href: ROUTES.home },
  { label: OFICIOS_NAV_LABEL, href: ROUTES.oficios },
  { label: "Eventos", href: ROUTES.eventos },
  { label: "Parceiros", href: ROUTES.parceiros },
  { label: "Notícias", href: ROUTES.noticias },
  { label: "Contato", href: ROUTES.contato },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-amopark-gray-light/80 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href={ROUTES.home}
          className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-amopark-blue rounded-md"
          aria-label="AMOPARK - Página inicial"
        >
          <Image
            src="/logo-amopark.png"
            alt="Logo AMOPARK - North Park"
            width={48}
            height={48}
            className="h-10 w-10 object-contain sm:h-12 sm:w-12"
            priority
          />
          <span className="font-semibold text-amopark-charcoal text-lg">
            {siteConfig.name}
          </span>
        </Link>

        {/* Desktop menu */}
        <ul className="hidden md:flex md:items-center md:gap-8">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="text-amopark-charcoal hover:text-amopark-blue transition-colors font-medium"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="inline-flex md:hidden items-center justify-center rounded-md p-2 text-amopark-charcoal hover:bg-amopark-gray-light focus:outline-none focus:ring-2 focus:ring-amopark-blue"
          aria-expanded={open}
          aria-label={open ? "Fechar menu" : "Abrir menu"}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile menu panel */}
      <div
        className={cn(
          "md:hidden border-t border-amopark-gray-light/80 bg-white overflow-hidden transition-all duration-200 ease-out",
          open ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <ul className="flex flex-col px-4 py-4 gap-1">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={() => setOpen(false)}
                className="block py-3 px-2 text-amopark-charcoal hover:bg-amopark-gray-light hover:text-amopark-blue rounded-md font-medium transition-colors"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}
