import { ExternalLink, FileText } from "lucide-react";
import { OficioStatusBadge } from "@/components/OficioStatusBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import type { OficioRecord } from "@/lib/oficios-types";
import { formatOficioTableDate } from "@/lib/oficios-display";

export function OficiosListView({ oficios }: { oficios: OficioRecord[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-amopark-gray-light bg-white shadow-sm">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="whitespace-nowrap">Nº do ofício</TableHead>
              <TableHead>Assunto</TableHead>
              <TableHead className="hidden md:table-cell">Enviado para</TableHead>
              <TableHead className="whitespace-nowrap">Data</TableHead>
              <TableHead>Situação</TableHead>
              <TableHead className="text-right">Documento</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {oficios.map((o) => (
              <TableRow key={o.id} className="align-top">
                <TableCell className="whitespace-nowrap font-medium text-amopark-charcoal">
                  {o.numeroOficio?.trim() || "—"}
                </TableCell>
                <TableCell>
                  <p className="font-medium text-amopark-charcoal">{o.name}</p>
                  {o.summary && (
                    <p className="mt-1 line-clamp-2 text-xs text-amopark-charcoal/65">
                      {o.summary}
                    </p>
                  )}
                  {o.destinatario && (
                    <p className="mt-1 text-xs text-amopark-purple md:hidden">
                      Para: {o.destinatario}
                    </p>
                  )}
                </TableCell>
                <TableCell className="hidden md:table-cell text-sm text-amopark-charcoal/80">
                  {o.destinatario?.trim() || "—"}
                </TableCell>
                <TableCell className="whitespace-nowrap text-sm text-amopark-charcoal/75">
                  {formatOficioTableDate(o.dataOficio, o.createdTime)}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <OficioStatusBadge status={o.status} />
                </TableCell>
                <TableCell className="text-right">
                  <a
                    href={o.webViewLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-lg bg-amopark-blue px-3 py-1.5 text-xs font-medium text-white hover:bg-amopark-blue/90"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    Abrir
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
