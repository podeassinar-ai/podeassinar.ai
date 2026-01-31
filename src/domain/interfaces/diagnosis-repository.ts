import { LegalDiagnosis, DiagnosisStatus, RiskItem, LegalPathway } from '../entities/diagnosis';

export interface IDiagnosisRepository {
  create(diagnosis: LegalDiagnosis): Promise<LegalDiagnosis>;
  findById(id: string): Promise<LegalDiagnosis | null>;
  findByTransactionId(transactionId: string): Promise<LegalDiagnosis | null>;
  updateStatus(id: string, status: DiagnosisStatus): Promise<LegalDiagnosis>;
  updateContent(id: string, content: {
    propertyStatus?: string;
    risks?: RiskItem[];
    pathways?: LegalPathway[];
    summary?: string;
  }): Promise<LegalDiagnosis>;
  markReviewed(id: string, reviewerId: string): Promise<LegalDiagnosis>;
  markDelivered(id: string): Promise<LegalDiagnosis>;
  findPendingReview(): Promise<LegalDiagnosis[]>;
}
