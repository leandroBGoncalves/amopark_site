"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Bell,
  CalendarDays,
  CheckCircle2,
  FileText,
  Loader2,
  Mail,
  Sparkles,
  Trophy,
} from "lucide-react";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

const benefits = [
  {
    icon: FileText,
    text: "Ofícios e pedidos formais enviados pela AMOPARK",
  },
  {
    icon: CalendarDays,
    text: "Datas e eventos confirmados no North Park",
  },
  {
    icon: Trophy,
    text: "Conquistas e vitórias do bairro em primeira mão",
  },
];

export function HomeNewsletterCta() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [alreadyExists, setAlreadyExists] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setAlreadyExists(false);
    setSending(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, email, website }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(
          typeof data?.error === "string"
            ? data.error
            : "Não foi possível inscrever. Tente novamente."
        );
        return;
      }
      setSuccess(true);
      setAlreadyExists(data.alreadyExists === true);
      setEmail("");
      setNome("");
    } catch {
      setError("Erro de conexão. Verifique sua internet e tente de novo.");
    } finally {
      setSending(false);
    }
  }

  return (
    <section
      className="relative overflow-hidden border-t border-amopark-blue/20 bg-gradient-to-br from-amopark-blue via-amopark-blue to-amopark-purple px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
      aria-labelledby="newsletter-cta-heading"
    >
      <div
        className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-amopark-yellow/20 blur-3xl"
        aria-hidden
      />

      <div className="relative mx-auto max-w-6xl">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-14">
          <div className="text-white">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-amopark-yellow" />
              Gratuito · só o que importa
            </p>
            <h2
              id="newsletter-cta-heading"
              className="mt-4 text-3xl font-bold leading-tight sm:text-4xl"
            >
              Não fique de fora: receba as novidades do North Park no seu e-mail
            </h2>
            <p className="mt-4 text-lg text-white/90 leading-relaxed">
              A AMOPARK luta pelo bairro todos os dias. Inscreva-se e saiba na hora
              quando sair um ofício, confirmar um evento ou conquistarmos mais uma
              vitória — <strong className="font-semibold text-white">sem spam</strong>,
              direto da associação.
            </p>
            <ul className="mt-8 space-y-3">
              {benefits.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-start gap-3 text-sm sm:text-base">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/15">
                    <Icon className="h-4 w-4 text-amopark-yellow" />
                  </span>
                  <span className="text-white/95">{text}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 flex items-center gap-2 text-sm text-white/75">
              <Bell className="h-4 w-4 shrink-0" />
              Junte-se aos moradores que acompanham o North Park de perto.
            </p>
          </div>

          <div className="rounded-2xl border border-white/20 bg-white p-6 shadow-2xl shadow-amopark-charcoal/20 sm:p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amopark-blue/10">
                <Mail className="h-5 w-5 text-amopark-blue" />
              </div>
              <div>
                <p className="font-semibold text-amopark-charcoal">Inscrição na newsletter</p>
                <p className="text-sm text-amopark-charcoal/65">Leva menos de 1 minuto</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="relative mt-6 space-y-4">
              <div
                className="absolute -left-[9999px] h-0 w-0 overflow-hidden"
                aria-hidden
              >
                <input
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
              </div>

              <div>
                <label
                  htmlFor="newsletter-nome"
                  className="block text-sm font-medium text-amopark-charcoal"
                >
                  Seu nome <span className="font-normal text-amopark-charcoal/50">(opcional)</span>
                </label>
                <input
                  id="newsletter-nome"
                  type="text"
                  autoComplete="name"
                  maxLength={120}
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Como podemos te chamar?"
                  className="mt-1 w-full rounded-lg border border-amopark-gray-light px-3 py-2.5 text-sm focus:border-amopark-blue focus:outline-none focus:ring-1 focus:ring-amopark-blue"
                />
              </div>

              <div>
                <label
                  htmlFor="newsletter-email"
                  className="block text-sm font-medium text-amopark-charcoal"
                >
                  E-mail <span className="text-amopark-orange">*</span>
                </label>
                <input
                  id="newsletter-email"
                  type="email"
                  required
                  autoComplete="email"
                  maxLength={200}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="mt-1 w-full rounded-lg border border-amopark-gray-light px-3 py-2.5 text-sm focus:border-amopark-blue focus:outline-none focus:ring-1 focus:ring-amopark-blue"
                />
              </div>

              {error && (
                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                  {error}
                </p>
              )}
              {success && (
                <p className="flex items-start gap-2 rounded-lg border border-amopark-green/30 bg-amopark-green/10 px-3 py-2 text-sm text-amopark-charcoal">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-amopark-green" />
                  {alreadyExists
                    ? "Este e-mail já está na nossa lista. Em breve você receberá as próximas novidades!"
                    : "Inscrição confirmada! Fique de olho na caixa de entrada (e no spam, por precaução)."}
                </p>
              )}

              <button
                type="submit"
                disabled={sending}
                className={cn(
                  "w-full rounded-xl bg-amopark-orange px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-amopark-orange/30 transition-all",
                  "hover:bg-amopark-orange/90 hover:shadow-xl disabled:opacity-60"
                )}
              >
                {sending ? (
                  <span className="inline-flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Inscrevendo…
                  </span>
                ) : (
                  "Quero receber as novidades do bairro"
                )}
              </button>

              <p className="text-center text-xs text-amopark-charcoal/55 leading-relaxed">
                Ao se inscrever, você concorda em receber comunicações da AMOPARK.
                Sem repasse a terceiros.{" "}
                <Link
                  href={ROUTES.privacidade}
                  className="text-amopark-blue underline-offset-2 hover:underline"
                >
                  Política de privacidade
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
