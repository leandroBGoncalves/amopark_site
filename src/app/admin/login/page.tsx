"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const forbidden = searchParams.get("error") === "forbidden";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: signErr } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (signErr) {
        setError(signErr.message);
        return;
      }
      const to = searchParams.get("from") || "/admin";
      router.push(to);
      router.refresh();
    } catch {
      setError("Erro de rede.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="text-xl font-bold text-amopark-charcoal">Painel AMOPARK</h1>
      <p className="mt-1 text-sm text-amopark-charcoal/70">
        Entre com o e-mail e senha cadastrados no Supabase Auth.
      </p>
      {forbidden && (
        <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          Sua conta não tem permissão de administrador. Peça à diretoria para
          definir <code className="text-xs">role = admin</code> na tabela{" "}
          <code className="text-xs">profiles</code> no Supabase.
        </p>
      )}
      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-amopark-charcoal">
            E-mail
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-amopark-gray-light px-3 py-2 text-amopark-charcoal"
            autoComplete="email"
            required
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-amopark-charcoal">
            Senha
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-amopark-gray-light px-3 py-2 text-amopark-charcoal"
            autoComplete="current-password"
            required
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-amopark-blue py-2.5 font-medium text-white hover:bg-amopark-blue/90 disabled:opacity-60"
        >
          {loading ? (
            <span className="inline-flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Entrando...
            </span>
          ) : (
            "Entrar"
          )}
        </button>
      </form>
      <p className="mt-8 text-center text-sm text-amopark-charcoal/60">
        <Link href="/" className="text-amopark-blue hover:underline">
          Voltar ao site
        </Link>
      </p>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-amopark-charcoal/70">Carregando...</div>}>
      <LoginForm />
    </Suspense>
  );
}
