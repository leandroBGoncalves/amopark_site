"use client";

import Link from "next/link";
import { useState } from "react";
import { Loader2, Send } from "lucide-react";
import {
  FALE_CONOSCO_TIPOS,
  FALE_CONOSCO_TIPO_LABELS,
  type FaleConoscoTipo,
} from "@/lib/fale-conosco-types";
import { cn } from "@/lib/utils";

export function FaleConoscoForm() {
  const [tipo, setTipo] = useState<FaleConoscoTipo>("sugestao");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [assunto, setAssunto] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [website, setWebsite] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [protocolo, setProtocolo] = useState<string | null>(null);
  const [trackingPath, setTrackingPath] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setProtocolo(null);
    setTrackingPath(null);
    setSending(true);
    try {
      const res = await fetch("/api/fale-conosco", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo,
          nome,
          email,
          telefone,
          assunto,
          mensagem,
          website,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(
          typeof data?.error === "string"
            ? data.error
            : "Não foi possível enviar. Tente novamente."
        );
        return;
      }
      setProtocolo(typeof data.protocolo === "string" ? data.protocolo : null);
      setTrackingPath(typeof data.trackingPath === "string" ? data.trackingPath : null);
      setNome("");
      setEmail("");
      setTelefone("");
      setAssunto("");
      setMensagem("");
    } catch {
      setError("Erro de conexão. Verifique sua internet e tente de novo.");
    } finally {
      setSending(false);
    }
  }

  const inputClass =
    "mt-1 w-full rounded-lg border border-amopark-gray-light px-3 py-2 text-sm text-amopark-charcoal focus:border-amopark-blue focus:outline-none focus:ring-1 focus:ring-amopark-blue";

  return (
    <form onSubmit={handleSubmit} className="relative space-y-5">
      <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden>
        <label htmlFor="fc_website">Website</label>
        <input
          id="fc_website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>

      <fieldset>
        <legend className="text-sm font-medium text-amopark-charcoal">
          O que você quer enviar? <span className="text-amopark-orange">*</span>
        </legend>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {FALE_CONOSCO_TIPOS.map((t) => (
            <label
              key={t}
              className={cn(
                "flex cursor-pointer items-center justify-center rounded-lg border px-3 py-2.5 text-center text-sm font-medium transition-colors",
                tipo === t
                  ? "border-amopark-blue bg-amopark-blue/10 text-amopark-blue"
                  : "border-amopark-gray-light bg-white text-amopark-charcoal hover:border-amopark-blue/40"
              )}
            >
              <input
                type="radio"
                name="tipo"
                value={t}
                checked={tipo === t}
                onChange={() => setTipo(t)}
                className="sr-only"
              />
              {FALE_CONOSCO_TIPO_LABELS[t]}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="fc_nome" className="block text-sm font-medium text-amopark-charcoal">
            Nome <span className="text-amopark-orange">*</span>
          </label>
          <input
            id="fc_nome"
            required
            maxLength={120}
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className={inputClass}
            autoComplete="name"
          />
        </div>
        <div>
          <label htmlFor="fc_email" className="block text-sm font-medium text-amopark-charcoal">
            E-mail <span className="text-amopark-orange">*</span>
          </label>
          <input
            id="fc_email"
            type="email"
            required
            maxLength={200}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            autoComplete="email"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="fc_telefone" className="block text-sm font-medium text-amopark-charcoal">
            Telefone / WhatsApp
          </label>
          <input
            id="fc_telefone"
            type="tel"
            maxLength={30}
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            className={inputClass}
            autoComplete="tel"
          />
        </div>
        <div>
          <label htmlFor="fc_assunto" className="block text-sm font-medium text-amopark-charcoal">
            Assunto
          </label>
          <input
            id="fc_assunto"
            maxLength={200}
            value={assunto}
            onChange={(e) => setAssunto(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="fc_mensagem" className="block text-sm font-medium text-amopark-charcoal">
          Mensagem <span className="text-amopark-orange">*</span>
        </label>
        <textarea
          id="fc_mensagem"
          required
          rows={6}
          maxLength={5000}
          value={mensagem}
          onChange={(e) => setMensagem(e.target.value)}
          className={cn(inputClass, "min-h-[140px] resize-y")}
          placeholder="Descreva com calma sua sugestão, reclamação ou dúvida sobre o bairro ou a associação..."
        />
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      )}
      {protocolo && (
        <div className="rounded-lg border border-amopark-green/30 bg-amopark-green/10 px-4 py-3 text-sm text-amopark-charcoal">
          <p className="font-semibold">Mensagem enviada com sucesso!</p>
          <p className="mt-1">
            Seu protocolo é <strong className="text-amopark-blue">{protocolo}</strong>.
            Enviamos a confirmação para seu e-mail — você será avisado quando a diretoria
            responder ou atualizar o andamento.
          </p>
          {trackingPath && (
            <Link
              href={trackingPath}
              className="mt-3 inline-flex rounded-lg bg-amopark-purple px-4 py-2 text-sm font-semibold text-white hover:bg-amopark-purple/90"
            >
              Acompanhar solicitação
            </Link>
          )}
        </div>
      )}

      <button
        type="submit"
        disabled={sending}
        className="inline-flex items-center gap-2 rounded-lg bg-amopark-blue px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-amopark-blue/90 disabled:opacity-60"
      >
        {sending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Enviando…
          </>
        ) : (
          <>
            <Send className="h-4 w-4" />
            Enviar mensagem
          </>
        )}
      </button>
    </form>
  );
}
