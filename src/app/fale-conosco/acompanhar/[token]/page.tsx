import { unstable_noStore as noStore } from "next/cache";
import { MessageSquareWarning } from "lucide-react";
import { getFaleConoscoByAccessToken } from "@/lib/fale-conosco-db";
import { FaleConoscoTrackingClient } from "../FaleConoscoTrackingClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

type PageProps = { params: { token: string } };

export async function generateMetadata({ params }: PageProps) {
  noStore();
  const result = await getFaleConoscoByAccessToken(params.token);
  if (result.kind === "active") {
    return {
      title: `Acompanhar ${result.data.protocolo}`,
      description: "Acompanhe o andamento da sua solicitação à AMOPARK.",
    };
  }
  return {
    title: "Acompanhar solicitação",
    description: "Acompanhamento de solicitações enviadas à AMOPARK.",
  };
}

export default function FaleConoscoAcompanharPage({ params }: PageProps) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="flex items-center gap-2 text-2xl font-bold text-amopark-charcoal sm:text-3xl">
        <MessageSquareWarning className="h-8 w-8 text-amopark-purple" />
        Acompanhar solicitação
      </h1>

      <div className="mt-8 rounded-xl border border-amopark-gray-light bg-white p-6 shadow-sm sm:p-8">
        <FaleConoscoTrackingClient token={params.token} />
      </div>
    </div>
  );
}
