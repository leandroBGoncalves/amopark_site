import Link from "next/link";
import { MessageCircle, Mail, FileText } from "lucide-react";
import { ROUTES } from "@/lib/constants";
import { siteConfig } from "@/lib/utils";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-amopark-gray-light bg-amopark-gray-light/50">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <p className="font-semibold text-amopark-charcoal text-lg">
              {siteConfig.name}
            </p>
            <p className="mt-1 text-sm text-amopark-charcoal/80">
              {siteConfig.fullName}
            </p>
            <p className="mt-2 text-sm font-medium text-amopark-charcoal/90">
              {siteConfig.slogan}
            </p>
          </div>

          {/* Links */}
          <div>
            <p className="font-semibold text-amopark-charcoal">Institucional</p>
            <ul className="mt-3 space-y-2">
              <li>
                <Link
                  href={ROUTES.transparencia}
                  className="text-sm text-amopark-charcoal/80 hover:text-amopark-blue transition-colors"
                >
                  Transparência
                </Link>
              </li>
              <li>
                <Link
                  href={ROUTES.eventos}
                  className="text-sm text-amopark-charcoal/80 hover:text-amopark-blue transition-colors"
                >
                  Eventos
                </Link>
              </li>
              <li>
                <Link
                  href={ROUTES.noticias}
                  className="text-sm text-amopark-charcoal/80 hover:text-amopark-blue transition-colors"
                >
                  Notícias e conquistas
                </Link>
              </li>
              <li>
                <Link
                  href={ROUTES.contato}
                  className="text-sm text-amopark-charcoal/80 hover:text-amopark-blue transition-colors"
                >
                  Contato
                </Link>
              </li>
              <li>
                <Link
                  href={ROUTES.privacidade}
                  className="text-sm text-amopark-charcoal/80 hover:text-amopark-blue transition-colors"
                >
                  Política de Privacidade
                </Link>
              </li>
              <li>
                <Link
                  href="/admin"
                  className="text-sm text-amopark-charcoal/50 hover:text-amopark-charcoal/80 transition-colors"
                >
                  Área administrativa
                </Link>
              </li>
            </ul>
          </div>

          {/* Atendimento */}
          <div>
            <p className="font-semibold text-amopark-charcoal">Atendimento</p>
            <ul className="mt-3 space-y-3">
              <li>
                <a
                  href={siteConfig.links.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-amopark-charcoal/80 hover:text-amopark-green transition-colors"
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </a>
              </li>
              <li>
                <Link
                  href={siteConfig.links.formContato}
                  className="inline-flex items-center gap-2 text-sm text-amopark-charcoal/80 hover:text-amopark-blue transition-colors"
                >
                  <Mail className="h-4 w-4" />
                  Formulário de contato
                </Link>
              </li>
              <li>
                <Link
                  href={ROUTES.privacidade}
                  className="inline-flex items-center gap-2 text-sm text-amopark-charcoal/80 hover:text-amopark-purple transition-colors"
                >
                  <FileText className="h-4 w-4" />
                  LGPD e Privacidade
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-amopark-gray-light pt-8 text-center text-sm text-amopark-charcoal/70">
          <p>
            © {currentYear} {siteConfig.name} — {siteConfig.fullName}. Todos os
            direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
