"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { OficioCard } from "@/components/OficioCard";
import type { OficioRecord } from "@/lib/oficios-types";

export function TransparenciaClient() {
  const [oficios, setOficios] = useState<OficioRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOficios = useCallback(async (opts?: { silent?: boolean }) => {
    const silent = opts?.silent ?? false;
    setError(null);
    if (!silent) setLoading(true);
    try {
      const res = await fetch(`/api/oficios?r=${Date.now()}`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok) {
        const msg =
          typeof data === "object" &&
          data !== null &&
          "error" in data &&
          typeof (data as { error: string }).error === "string"
            ? (data as { error: string }).error
            : "Falha ao carregar ofícios.";
        throw new Error(msg);
      }
      setOficios(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro desconhecido.");
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOficios();
  }, [fetchOficios]);

  useEffect(() => {
    function onVisible() {
      if (document.visibilityState === "visible") fetchOficios({ silent: true });
    }
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [fetchOficios]);

  if (loading) {
    return (
      <div className="mt-10 flex flex-col items-center justify-center gap-3 py-12 text-amopark-charcoal/70">
        <Loader2 className="h-10 w-10 animate-spin" />
        <p>Carregando ofícios...</p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <p className="mb-6 text-sm text-amopark-charcoal/70">
        {oficios.length === 0
          ? "Nenhum ofício publicado no mural. A diretoria pode enviar documentos pelo painel administrativo."
          : `${oficios.length} ofício(s) listado(s).`}
      </p>

      {error && (
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <AlertCircle className="h-5 w-5 shrink-0" />
          {error}
        </div>
      )}

      {oficios.length === 0 && !error ? (
        <div className="rounded-xl border border-amopark-gray-light bg-amopark-gray-light/30 p-12 text-center text-amopark-charcoal/70">
          Em breve haverá ofícios e solicitações publicados aqui. A publicação é feita pela
          equipe da AMOPARK pelo painel administrativo.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
          {oficios.map((o) => (
            <OficioCard
              key={o.id}
              title={o.name}
              createdTime={o.createdTime}
              dataOficio={o.dataOficio}
              summary={o.summary}
              numeroOficio={o.numeroOficio}
              destinatario={o.destinatario}
              status={o.status}
              webViewLink={o.webViewLink}
            />
          ))}
        </div>
      )}
    </div>
  );
}
