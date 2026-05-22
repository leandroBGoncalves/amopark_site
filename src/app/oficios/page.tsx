import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/constants";

/** Atalho amigável: moradores digitam /oficios no lugar de /transparencia. */
export default function OficiosRedirectPage() {
  redirect(ROUTES.transparencia);
}
