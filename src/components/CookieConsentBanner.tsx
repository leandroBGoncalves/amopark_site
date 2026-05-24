"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Cookie, X } from "lucide-react";
import { ROUTES } from "@/lib/constants";
import { COOKIE_CONSENT_KEY } from "@/lib/constants";

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (consent === null) setVisible(true);
  }, []);

  const notifyConsentChange = () => {
    window.dispatchEvent(new Event("cookie-consent-updated"));
  };

  const accept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
    notifyConsentChange();
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "declined");
    notifyConsentChange();
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Consentimento de cookies (LGPD)"
      className="fixed bottom-0 left-0 right-0 z-[100] border-t border-amopark-gray-light bg-white p-4 shadow-lg sm:left-4 sm:right-4 sm:bottom-4 sm:max-w-xl sm:rounded-lg"
    >
      <div className="flex gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amopark-gray-light">
          <Cookie className="h-5 w-5 text-amopark-charcoal" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-amopark-charcoal">
            Utilizamos cookies para melhorar sua experiência e cumprir a LGPD.
          </p>
          <p className="mt-1 text-xs text-amopark-charcoal/70">
            Ao continuar, você concorda com nossa{" "}
            <Link
              href={ROUTES.privacidade}
              className="underline hover:text-amopark-blue"
            >
              Política de Privacidade
            </Link>
            .
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={accept}
              className="rounded-md bg-amopark-blue px-3 py-1.5 text-sm font-medium text-white hover:bg-amopark-blue/90 transition-colors"
            >
              Aceitar
            </button>
            <button
              type="button"
              onClick={decline}
              className="rounded-md border border-amopark-gray-light bg-white px-3 py-1.5 text-sm font-medium text-amopark-charcoal hover:bg-amopark-gray-light transition-colors"
            >
              Recusar
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={decline}
          className="shrink-0 rounded p-1 text-amopark-charcoal/70 hover:bg-amopark-gray-light hover:text-amopark-charcoal transition-colors"
          aria-label="Fechar"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
