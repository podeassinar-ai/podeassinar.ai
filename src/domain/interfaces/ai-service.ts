import { RiskItem, LegalPathway } from '../entities/diagnosis';
import { DiagnosticQuestionnaire } from '../entities/questionnaire';
import { Document } from '../entities/document';
import { AIReasoningTier, AIAnalysisMetadata } from '../types/ai-reasoning';

export interface AIAnalysisInput {
  questionnaire: DiagnosticQuestionnaire;
  documents: Document[];
  documentContents: Array<{
    documentId: string;
    extractedText: string;
  }>;
  /** Optional: the reasoning tier to use. Defaults to DIAGNOSTIC. */
  tier?: AIReasoningTier;
}

export interface AIAnalysisResult {
  propertyStatus: string;
  risks: RiskItem[];
  pathways: LegalPathway[];
  summary: string;
  confidence: number;
  /** Metadata for audit logging */
  metadata: AIAnalysisMetadata;
}

export interface IAIService {
  analyzeForDiagnosis(input: AIAnalysisInput): Promise<AIAnalysisResult>;
  extractDocumentData(documentContent: Buffer, mimeType: string): Promise<Record<string, unknown>>;
  classifyIntent(userMessage: string): Promise<string>;
}

