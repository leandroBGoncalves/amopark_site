"use client";

import { Analytics } from "@vercel/analytics/react";
import { useEffect, useState } from "react";
import { COOKIE_CONSENT_KEY } from "@/lib/constants";

function hasAnalyticsConsent(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(COOKIE_CONSENT_KEY) === "accepted";
}

/** Vercel Web Analytics — só após consentimento de cookies (LGPD). */
export function VercelAnalytics() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const sync = () => setEnabled(hasAnalyticsConsent());
    sync();
    window.addEventListener("cookie-consent-updated", sync);
    return () => window.removeEventListener("cookie-consent-updated", sync);
  }, []);

  if (!enabled) return null;
  return <Analytics />;
}
