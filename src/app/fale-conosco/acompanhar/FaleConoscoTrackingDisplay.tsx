import Link from "next/link";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Lock,
} from "lucide-react";
import { ROUTES } from "@/lib/constants";
import {
  FALE_CONOSCO_STATUS_LABELS,
  FALE_CONOSCO_TIPO_LABELS,
  type FaleConoscoStatus,
  type FaleConoscoTrackingLookup,
  type FaleConoscoTrackingView,
} from "@/lib/fale-conosco-types";
import { cn } from "@/lib/utils";

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusBadgeClass(status: FaleConoscoStatus): string {
  switch (status) {
    case "novo":
      return "bg-amopark-orange/15 text-amopark-orange";
    case "em_analise":
      return "bg-amopark-purple/15 text-amopark-purple";
    case "respondido":
      return "bg-amopark-green/15 text-amopark-green";
    case "arquivado":
      return "bg-amopark-charcoal/10 text-amopark-charcoal/70";
  }
}

function TrackingTimeline({ data }: { data: FaleConoscoTrackingView }) {
  const steps: { key: string; label: string; done: boolean; active: boolean }[] = [
    {
      key: "recebida",
      label: "Recebida",
      done: true,
      active: data.status === "novo",
    },
    {
      key: "analise",
      label: "Em análise",
      done: data.status === "em_analise" || data.status === "respondido",
      active: data.status === "em_analise",
    },
    {
      key: "respondida",
      label: "Respondida",
      done: data.status === "respondido" || Boolean(data.resposta?.trim()),
      active: data.status === "respondido",
    },
  ];

  return (
    <ol className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-0">
      {steps.map((step, index) => (
        <li
          key={step.key}
          className={cn(
            "flex items-center gap-2 sm:flex-1",
            index < steps.length - 1 && "sm:pr-2"
          )}
        >
          <span
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold",
              step.done
                ? "bg-amopark-green text-white"
                : step.active
                  ? "bg-amopark-blue text-white"
                  : "bg-amopark-gray-light text-amopark-charcoal/50"
            )}
          >
            {step.done ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
          </span>
          <span
            className={cn(
              "text-sm font-medium",
              step.done || step.active
                ? "text-amopark-charcoal"
                : "text-amopark-charcoal/50"
            )}
          >
            {step.label}
          </span>
          {index < steps.length - 1 && (
            <span className="mx-2 hidden h-px flex-1 bg-amopark-gray-light sm:block" />
          )}
        </li>
      ))}
    </ol>
  );
}

function ActiveTracking({ data }: { data: FaleConoscoTrackingView }) {
  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-sm font-semibold text-amopark-blue">
          {data.protocolo}
        </span>
        <span className="rounded-full bg-amopark-gray-light/80 px-2.5 py-0.5 text-xs font-medium text-amopark-charcoal/80">
          {FALE_CONOSCO_TIPO_LABELS[data.tipo]}
        </span>
        <span
          className={cn(
            "rounded-full px-2.5 py-0.5 text-xs font-medium",
            statusBadgeClass(data.status)
          )}
        >
          {FALE_CONOSCO_STATUS_LABELS[data.status]}
        </span>
      </div>

      <TrackingTimeline data={data} />

      <dl className="mt-8 grid gap-4 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-amopark-charcoal/50">Enviada em</dt>
          <dd className="mt-0.5 font-medium text-amopark-charcoal">
            {formatDateTime(data.created_at)}
          </dd>
        </div>
        <div>
          <dt className="text-amopark-charcoal/50">Última atualização</dt>
          <dd className="mt-0.5 font-medium text-amopark-charcoal">
            {formatDateTime(data.updated_at)}
          </dd>
        </div>
        {data.assunto && (
          <div className="sm:col-span-2">
            <dt className="text-amopark-charcoal/50">Assunto</dt>
            <dd className="mt-0.5 font-medium text-amopark-charcoal">{data.assunto}</dd>
          </div>
        )}
      </dl>

      <div className="mt-6">
        <h2 className="text-sm font-semibold text-amopark-charcoal">Sua mensagem</h2>
        <p className="mt-2 whitespace-pre-wrap rounded-lg bg-amopark-gray-light/40 p-4 text-sm text-amopark-charcoal">
          {data.mensagem}
        </p>
      </div>

      {data.resposta?.trim() ? (
        <div className="mt-6 rounded-lg border border-amopark-green/30 bg-amopark-green/5 p-4">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-amopark-charcoal">
            <CheckCircle2 className="h-4 w-4 text-amopark-green" />
            Resposta da AMOPARK
          </h2>
          {data.resposta_at && (
            <p className="mt-1 text-xs text-amopark-charcoal/60">
              {formatDateTime(data.resposta_at)}
            </p>
          )}
          <p className="mt-3 whitespace-pre-wrap text-sm text-amopark-charcoal">
            {data.resposta.trim()}
          </p>
        </div>
      ) : (
        <div className="mt-6 flex items-start gap-3 rounded-lg border border-amopark-blue/20 bg-amopark-blue/5 p-4 text-sm text-amopark-charcoal">
          <Clock className="mt-0.5 h-4 w-4 shrink-0 text-amopark-blue" />
          <p>
            Sua solicitação está com a diretoria. Quando houver novidade, você receberá um
            e-mail e esta página será atualizada.
          </p>
        </div>
      )}

      <p className="mt-6 text-xs text-amopark-charcoal/60">
        Este link é pessoal e temporário. Quando a solicitação for encerrada pela AMOPARK,
        o acesso será revogado automaticamente.
      </p>
    </>
  );
}

function RevokedTracking({
  protocolo,
  revokedAt,
}: {
  protocolo: string;
  revokedAt: string | null;
}) {
  return (
    <div className="text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amopark-charcoal/10">
        <Lock className="h-7 w-7 text-amopark-charcoal/60" />
      </div>
      <h2 className="mt-4 text-lg font-semibold text-amopark-charcoal">
        Solicitação encerrada
      </h2>
      <p className="mt-2 text-sm text-amopark-charcoal/75">
        O protocolo <strong className="font-mono text-amopark-blue">{protocolo}</strong> foi
        encerrado pela AMOPARK
        {revokedAt ? ` em ${formatDateTime(revokedAt)}` : ""}. Este link de acompanhamento
        não está mais disponível.
      </p>
      <Link
        href={ROUTES.faleConosco}
        className="mt-6 inline-flex rounded-lg bg-amopark-purple px-5 py-2.5 text-sm font-semibold text-white hover:bg-amopark-purple/90"
      >
        Enviar nova mensagem
      </Link>
    </div>
  );
}

function NotFoundTracking() {
  return (
    <div className="text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amopark-orange/15">
        <AlertCircle className="h-7 w-7 text-amopark-orange" />
      </div>
      <h2 className="mt-4 text-lg font-semibold text-amopark-charcoal">
        Link inválido ou expirado
      </h2>
      <p className="mt-2 text-sm text-amopark-charcoal/75">
        Não encontramos uma solicitação para este endereço. Verifique o link recebido por
        e-mail ou envie uma nova mensagem.
      </p>
      <Link
        href={ROUTES.faleConosco}
        className="mt-6 inline-flex rounded-lg bg-amopark-purple px-5 py-2.5 text-sm font-semibold text-white hover:bg-amopark-purple/90"
      >
        Ir para o formulário
      </Link>
    </div>
  );
}

export function FaleConoscoTrackingResult({ result }: { result: FaleConoscoTrackingLookup }) {
  if (result.kind === "active") {
    return <ActiveTracking data={result.data} />;
  }
  if (result.kind === "revoked") {
    return (
      <RevokedTracking protocolo={result.protocolo} revokedAt={result.revoked_at} />
    );
  }
  return <NotFoundTracking />;
}
