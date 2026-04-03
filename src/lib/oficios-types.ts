import type { OficioStatusValue } from "./oficios-status";

export interface OficioRecord {
  id: string;
  name: string;
  webViewLink: string;
  createdTime: string;
  summary: string;
  numeroOficio: string | null;
  destinatario: string | null;
  /** YYYY-MM-DD quando informada no upload; exibição usa isso ou createdTime */
  dataOficio: string | null;
  status: OficioStatusValue;
  syncedAt: string;
  /** Legado: ID no Google Drive */
  driveFileId?: string;
  /** Arquivo salvo em data/uploads/oficios/ (upload pelo painel) */
  storageFilename?: string;
}

export interface OficiosStore {
  oficios: OficioRecord[];
  lastSyncAt: string | null;
}
