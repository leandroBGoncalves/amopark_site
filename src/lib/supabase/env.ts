export function getSupabaseUrl(): string {
  const url =
    process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) throw new Error("Defina SUPABASE_URL no .env.local");
  return url;
}

export function getSupabaseAnonKey(): string {
  const key =
    process.env.SUPABASE_ANON_KEY ??
    process.env.SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!key) throw new Error("Defina SUPABASE_ANON_KEY (ou SUPABASE_PUBLISHABLE_KEY) no .env.local");
  return key;
}

export function getSupabaseServiceRoleKey(): string {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("Defina SUPABASE_SERVICE_ROLE_KEY no .env.local");
  return key;
}
