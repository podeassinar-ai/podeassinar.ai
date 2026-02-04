/**
 * AI Reasoning Tier Strategy
 *
 * Defines the level of AI reasoning required for a legal analysis task.
 * Models are resolved internally based on the tier, ensuring the domain
 * remains technology-agnostic.
 */
export type AIReasoningTier = 'DIAGNOSTIC' | 'DEEP_LEGAL';

/**
 * Metadata returned by the AI service for each analysis.
 * Used for audit logging and legal compliance.
 */
export interface AIAnalysisMetadata {
    /** The reasoning tier that was requested */
    tierUsed: AIReasoningTier;
    /** The exact model ID that responded (e.g., 'gpt-5-mini') */
    modelUsed: string;
    /** Optional: reason for escalation to a higher tier */
    escalationReason?: string;
    /** Timestamp of the analysis */
    analyzedAt: Date;
}
