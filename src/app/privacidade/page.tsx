import { Shield } from "lucide-react";

export const metadata = {
  title: "Política de Privacidade",
  description: "Política de privacidade e LGPD da AMOPARK.",
};

export default function PrivacidadePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="flex items-center gap-2 text-2xl font-bold text-amopark-charcoal sm:text-3xl">
        <Shield className="h-8 w-8 text-amopark-green" />
        Política de Privacidade
      </h1>
      <p className="mt-2 text-amopark-charcoal/80">
        Em conformidade com a Lei Geral de Proteção de Dados (LGPD — Lei nº
        13.709/2018).
      </p>
      <div className="mt-8 space-y-6 text-amopark-charcoal/90">
        <section>
          <h2 className="text-lg font-semibold text-amopark-charcoal">
            1. Controller dos dados
          </h2>
          <p>
            A Associação de Moradores do Bairro North Park (AMOPARK) é a
            responsável pelo tratamento dos dados pessoais coletados neste site,
            em conformidade com a LGPD.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-amopark-charcoal">
            2. Dados coletados
          </h2>
          <p>
            Podemos coletar dados fornecidos voluntariamente por você ao utilizar
            formulários de contato, inscrições na newsletter ou cookies de
            preferência. Com seu consentimento, utilizamos medição anônima de
            visitas (Vercel Analytics) para entender o uso do site. O banner de
            cookies registra sua escolha (LGPD).
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-amopark-charcoal">
            3. Finalidade e base legal
          </h2>
          <p>
            Os dados são utilizados exclusivamente para comunicação
            institucional, transparência e atendimento aos moradores. O
            tratamento se baseia no consentimento (quando aplicável) e no
            legítimo interesse da associação.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-amopark-charcoal">
            4. Seus direitos
          </h2>
          <p>
            Você tem direito de acesso, correção, exclusão, portabilidade e
            revogação do consentimento. Para exercer esses direitos, entre em
            contato conosco pelos canais oficiais de atendimento.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-amopark-charcoal">
            5. Alterações
          </h2>
          <p>
            Esta política pode ser atualizada. A data da última atualização
            consta no rodapé do site. O uso continuado do site após alterações
            constitui aceite das novas condições.
          </p>
        </section>
      </div>
    </div>
  );
}
