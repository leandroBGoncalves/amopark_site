# AMOPARK — Site Institucional

Site oficial da **Associação de Moradores do Bairro North Park** (AMOPARK): transparência, notícias e canais de atendimento.

## Stack

- **Next.js 14+** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Lucide React** (ícones)
- Componentes no estilo Shadcn/UI (tabelas, etc.)

## Como rodar

```bash
npm install
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

## Estrutura principal

- `src/app/` — Páginas (Home, Transparência, Notícias, Contato, Privacidade)
- `src/components/` — Navbar, Footer, Cards, Banner de Cookies, UI
- `src/lib/` — Utilitários e configurações

## Transparência e painel administrativo

A página **Transparência** lista os ofícios no **Supabase** (tabela `oficios` e arquivos no storage). O acesso ao painel é por **Supabase Auth** com perfil `admin`.

1. **`.env.local`**
   - Variáveis `SUPABASE_URL`, `SUPABASE_ANON_KEY` e `SUPABASE_SERVICE_ROLE_KEY` (e demais chaves do projeto).
   - Opcional: `NEXT_PUBLIC_SITE_URL`, links de redes (`NEXT_PUBLIC_*`).
   - **Newsletter (Nodemailer):** `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, `NEWSLETTER_NOTIFY_EMAIL`. Veja `.env.example`. Sem SMTP, a inscrição é salva no banco, mas os e-mails automáticos não são enviados.

2. **Fluxo**
   - Acesse **/admin/login**, entre com usuário admin e publique **.docx**, **PDF** ou **imagem**. Em `.docx`, o texto é extraído com Mammoth para a prévia; em PDF/imagem use o campo de resumo opcional no formulário.
   - Download público: **/api/oficios/file/[id]**.
   - Link no rodapé: **Área administrativa**.

## LGPD

O site inclui banner de consentimento de cookies e página de Política de Privacidade em `/privacidade`.
