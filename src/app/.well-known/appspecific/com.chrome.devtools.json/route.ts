import { NextResponse } from "next/server";

/**
 * Chrome DevTools faz essa requisição automaticamente.
 * Retornar 200 evita o 404 no console.
 */
export function GET() {
  return NextResponse.json({});
}
