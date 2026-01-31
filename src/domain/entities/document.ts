export type DocumentType = 
  | 'MATRICULA'
  | 'MATRICULA_ANTIGA'
  | 'IPTU'
  | 'RG_CPF'
  | 'CERTIDAO_CASAMENTO'
  | 'COMPROVANTE_ENDERECO'
  | 'PROCURACAO'
  | 'CONTRATO'
  | 'OUTROS';

export type DocumentStatus = 
  | 'UPLOADED'
  | 'PROCESSING'
  | 'VALIDATED'
  | 'REJECTED'
  | 'EXPIRED';

export type LegalBasis = 
  | 'CONSENT'
  | 'CONTRACT_EXECUTION'
  | 'LEGAL_OBLIGATION';

export interface Document {
  id: string;
  transactionId: string;
  type: DocumentType;
  status: DocumentStatus;
  storageRef: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  legalBasis: LegalBasis;
  expiresAt: Date;
  extractedData?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export function createDocument(params: {
  id: string;
  transactionId: string;
  type: DocumentType;
  storageRef: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  legalBasis: LegalBasis;
  retentionDays?: number;
}): Document {
  const now = new Date();
  const expiresAt = new Date(now);
  expiresAt.setDate(expiresAt.getDate() + (params.retentionDays ?? 30));

  return {
    id: params.id,
    transactionId: params.transactionId,
    type: params.type,
    status: 'UPLOADED',
    storageRef: params.storageRef,
    fileName: params.fileName,
    mimeType: params.mimeType,
    fileSize: params.fileSize,
    legalBasis: params.legalBasis,
    expiresAt,
    createdAt: now,
    updatedAt: now,
  };
}

export function isExpired(document: Document): boolean {
  return new Date() > document.expiresAt;
}

export function isMatricula(document: Document): boolean {
  return document.type === 'MATRICULA' || document.type === 'MATRICULA_ANTIGA';
}

export function isMatriculaValid(document: Document): boolean {
  if (!isMatricula(document)) return false;
  if (document.type === 'MATRICULA_ANTIGA') return false;
  
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  return document.createdAt > thirtyDaysAgo && document.status === 'VALIDATED';
}
