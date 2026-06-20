import { getSiteBaseUrl } from "@/lib/email/mailer";
import { ROUTES } from "@/lib/constants";

export function faleConoscoTrackingPath(token: string): string {
  return `${ROUTES.faleConosco}/acompanhar/${encodeURIComponent(token)}`;
}

export function faleConoscoTrackingUrl(token: string): string {
  return `${getSiteBaseUrl()}${faleConoscoTrackingPath(token)}`;
}
