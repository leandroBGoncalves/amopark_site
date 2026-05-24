"use client";

import { useState } from "react";
import { Loader2, Send } from "lucide-react";
import { cn } from "@/lib/utils";

export function ContatoForm() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [assunto, setAssunto] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [website, setWebsite] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setSending(true);
    try {
      const res = await fetch("/api/contato", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
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
      setSuccess(true);
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
    <form onSubmit={handleSubmit} className="relative space-y-4">
      {/* Honeypot — oculto para bots */}
      <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden>
        <label htmlFor="website">Website</label>
        <input
          id="website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="nome" className="block text-sm font-medium text-amopark-charcoal">
            Nome <span className="text-amopark-orange">*</span>
          </label>
          <input
            id="nome"
            name="nome"
            type="text"
            required
            autoComplete="name"
            maxLength={120}
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className={inputClass}
            placeholder="Seu nome completo"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-amopark-charcoal">
            E-mail <span className="text-amopark-orange">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            maxLength={200}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            placeholder="seu@email.com"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="telefone" className="block text-sm font-medium text-amopark-charcoal">
            Telefone / WhatsApp
          </label>
          <input
            id="telefone"
            name="telefone"
            type="tel"
            autoComplete="tel"
            maxLength={30}
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            className={inputClass}
            placeholder="(67) 99999-9999"
          />
        </div>
        <div>
          <label htmlFor="assunto" className="block text-sm font-medium text-amopark-charcoal">
            Assunto
          </label>
          <input
            id="assunto"
            name="assunto"
            type="text"
            maxLength={200}
            value={assunto}
            onChange={(e) => setAssunto(e.target.value)}
            className={inputClass}
            placeholder="Ex.: Iluminação pública no bairro"
          />
        </div>
      </div>

      <div>
        <label htmlFor="mensagem" className="block text-sm font-medium text-amopark-charcoal">
          Mensagem <span className="text-amopark-orange">*</span>
        </label>
        <textarea
          id="mensagem"
          name="mensagem"
          required
          rows={5}
          maxLength={5000}
          value={mensagem}
          onChange={(e) => setMensagem(e.target.value)}
          className={cn(inputClass, "resize-y min-h-[120px]")}
          placeholder="Escreva sua dúvida, sugestão ou pedido para a diretoria..."
        />
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      )}
      {success && (
        <p className="rounded-lg border border-amopark-green/30 bg-amopark-green/10 px-3 py-2 text-sm text-amopark-charcoal">
          Mensagem enviada com sucesso! A diretoria responderá pelos canais informados.
        </p>
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
