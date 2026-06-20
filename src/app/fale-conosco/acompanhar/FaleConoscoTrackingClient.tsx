"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import type { FaleConoscoTrackingLookup } from "@/lib/fale-conosco-types";
import { FaleConoscoTrackingResult } from "./FaleConoscoTrackingDisplay";

function isTrackingLookup(value: unknown): value is FaleConoscoTrackingLookup {
  if (!value || typeof value !== "object") return false;
  const kind = (value as { kind?: unknown }).kind;
  return kind === "active" || kind === "revoked" || kind === "not_found";
}

export function FaleConoscoTrackingClient({ token }: { token: string }) {
  const [result, setResult] = useState<FaleConoscoTrackingLookup | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (opts?: { silent?: boolean }) => {
      if (!opts?.silent) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      setError(null);
      try {
        const res = await fetch(
          `/api/fale-conosco/acompanhar/${encodeURIComponent(token)}?r=${Date.now()}`,
          { cache: "no-store" }
        );
        const data: unknown = await res.json();
        if (!res.ok) {
          throw new Error(
            typeof data === "object" &&
              data !== null &&
              "error" in data &&
              typeof (data as { error: string }).error === "string"
              ? (data as { error: string }).error
              : "Não foi possível carregar o andamento."
          );
        }
        if (!isTrackingLookup(data)) {
          throw new Error("Resposta inválida do servidor.");
        }
        setResult(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erro ao carregar.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token]
  );

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    function onVisible() {
      if (document.visibilityState === "visible") {
        void load({ silent: true });
      }
    }
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [load]);

  return (
    <>
      <div className="mb-4 flex justify-end">
        <button
          type="button"
          onClick={() => load({ silent: true })}
          disabled={loading || refreshing}
          className="inline-flex items-center gap-1.5 rounded-lg border border-amopark-gray-light px-3 py-1.5 text-xs font-medium text-amopark-charcoal hover:bg-amopark-gray-light/50 disabled:opacity-50"
        >
          {refreshing ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <RefreshCw className="h-3.5 w-3.5" />
          )}
          Atualizar
        </button>
      </div>

      {loading && !result ? (
        <div className="flex flex-col items-center gap-3 py-16 text-amopark-charcoal/70">
          <Loader2 className="h-10 w-10 animate-spin" />
          Carregando andamento…
        </div>
      ) : error && !result ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      ) : result ? (
        <FaleConoscoTrackingResult result={result} />
      ) : null}
    </>
  );
}
