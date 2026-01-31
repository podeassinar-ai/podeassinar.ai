export type DiagnosisStatus = 
  | 'DRAFT'
  | 'AI_GENERATED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'DELIVERED';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface RiskItem {
  id: string;
  category: string;
  description: string;
  level: RiskLevel;
  recommendation: string;
  estimatedCost?: {
    min: number;
    max: number;
    currency: string;
  };
}

export interface LegalPathway {
  id: string;
  title: string;
  description: string;
  steps: string[];
  estimatedDuration: string;
  estimatedCost: {
    min: number;
    max: number;
    currency: string;
  };
  prerequisites: string[];
}

export interface LegalDiagnosis {
  id: string;
  transactionId: string;
  status: DiagnosisStatus;
  propertyStatus: string;
  risks: RiskItem[];
  pathways: LegalPathway[];
  summary: string;
  aiGeneratedAt?: Date;
  reviewedBy?: string;
  reviewedAt?: Date;
  deliveredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export function createDiagnosis(params: {
  id: string;
  transactionId: string;
}): LegalDiagnosis {
  const now = new Date();
  return {
    id: params.id,
    transactionId: params.transactionId,
    status: 'DRAFT',
    propertyStatus: '',
    risks: [],
    pathways: [],
    summary: '',
    createdAt: now,
    updatedAt: now,
  };
}

export function canBeReviewed(diagnosis: LegalDiagnosis): boolean {
  return diagnosis.status === 'AI_GENERATED';
}

export function canBeDelivered(diagnosis: LegalDiagnosis): boolean {
  return diagnosis.status === 'APPROVED';
}

export function hasHighRisks(diagnosis: LegalDiagnosis): boolean {
  return diagnosis.risks.some(r => r.level === 'HIGH' || r.level === 'CRITICAL');
}

export function getTotalEstimatedCost(diagnosis: LegalDiagnosis): { min: number; max: number } {
  return diagnosis.pathways.reduce(
    (acc, pathway) => ({
      min: acc.min + pathway.estimatedCost.min,
      max: acc.max + pathway.estimatedCost.max,
    }),
    { min: 0, max: 0 }
  );
}
