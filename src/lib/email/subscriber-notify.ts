import { listNewsletterSubscribersForNotify } from "@/lib/newsletter-db";
import { isSmtpConfigured, sendEmail } from "./mailer";

export interface NewsletterSubscriber {
  email: string;
  nome: string | null;
}

export type SubscriberEmailContent = {
  subject: string;
  html: string;
  text: string;
};

/** Envia o mesmo conteúdo (com saudação personalizada) a todos os inscritos. Falhas só são logadas. */
export async function notifyNewsletterSubscribers(
  build: (subscriber: NewsletterSubscriber) => SubscriberEmailContent
): Promise<void> {
  if (!isSmtpConfigured()) {
    console.warn("[email] SMTP não configurado — aviso aos inscritos omitido.");
    return;
  }

  let subscribers: NewsletterSubscriber[];
  try {
    subscribers = await listNewsletterSubscribersForNotify();
  } catch (err) {
    console.error("[email] Falha ao listar inscritos da newsletter:", err);
    return;
  }

  if (subscribers.length === 0) return;

  for (const subscriber of subscribers) {
    try {
      const { subject, html, text } = build(subscriber);
      await sendEmail({ to: subscriber.email, subject, html, text });
    } catch (err) {
      console.error(
        `[email] Falha ao avisar inscrito ${subscriber.email}:`,
        err
      );
    }
  }
}
