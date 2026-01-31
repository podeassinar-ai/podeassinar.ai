import { LegalDiagnosis, RiskItem, LegalPathway } from '../entities/diagnosis';
import { DiagnosticQuestionnaire } from '../entities/questionnaire';
import { Document } from '../entities/document';

export interface AIAnalysisInput {
  questionnaire: DiagnosticQuestionnaire;
  documents: Document[];
  documentContents: Array<{
    documentId: string;
    extractedText: string;
  }>;
}

export interface AIAnalysisResult {
  propertyStatus: string;
  risks: RiskItem[];
  pathways: LegalPathway[];
  summary: string;
  confidence: number;
}

export interface IAIService {
  analyzeForDiagnosis(input: AIAnalysisInput): Promise<AIAnalysisResult>;
  extractDocumentData(documentContent: Buffer, mimeType: string): Promise<Record<string, unknown>>;
  classifyIntent(userMessage: string): Promise<string>;
}
