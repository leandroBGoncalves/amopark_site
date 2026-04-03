import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-amopark-gray-light/40">
      <header className="border-b border-amopark-gray-light bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <Link href="/admin" className="font-semibold text-amopark-charcoal">
            AMOPARK — Admin
          </Link>
          <Link
            href="/transparencia"
            className="text-sm text-amopark-blue hover:underline"
          >
            Ver mural público
          </Link>
        </div>
      </header>
      <div className="mx-auto max-w-4xl px-4 py-8">{children}</div>
    </div>
  );
}
