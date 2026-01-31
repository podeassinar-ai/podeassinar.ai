import { LegalDiagnosis, RiskItem, LegalPathway, canBeReviewed } from '@domain/entities/diagnosis';
import { canReviewDiagnosis } from '@domain/entities/user';
import { IDiagnosisRepository } from '@domain/interfaces/diagnosis-repository';
import { IUserRepository } from '@domain/interfaces/user-repository';
import { IAuditService } from '@domain/interfaces/audit-service';

export interface ReviewDiagnosisInput {
  reviewerId: string;
  diagnosisId: string;
  propertyStatus?: string;
  risks?: RiskItem[];
  pathways?: LegalPathway[];
  summary?: string;
  approve: boolean;
}

export class ReviewDiagnosisUseCase {
  constructor(
    private diagnosisRepository: IDiagnosisRepository,
    private userRepository: IUserRepository,
    private auditService: IAuditService
  ) {}

  async execute(input: ReviewDiagnosisInput): Promise<LegalDiagnosis> {
    const reviewer = await this.userRepository.findById(input.reviewerId);
    if (!reviewer) {
      throw new Error('Reviewer not found');
    }

    if (!canReviewDiagnosis(reviewer)) {
      throw new Error('User is not authorized to review diagnoses');
    }

    const diagnosis = await this.diagnosisRepository.findById(input.diagnosisId);
    if (!diagnosis) {
      throw new Error('Diagnosis not found');
    }

    if (!canBeReviewed(diagnosis)) {
      throw new Error('Diagnosis is not ready for review');
    }

    if (input.propertyStatus || input.risks || input.pathways || input.summary) {
      await this.diagnosisRepository.updateContent(input.diagnosisId, {
        propertyStatus: input.propertyStatus,
        risks: input.risks,
        pathways: input.pathways,
        summary: input.summary,
      });
    }

    const newStatus = input.approve ? 'APPROVED' : 'UNDER_REVIEW';
    await this.diagnosisRepository.updateStatus(input.diagnosisId, newStatus);

    if (input.approve) {
      await this.diagnosisRepository.markReviewed(input.diagnosisId, input.reviewerId);
    }

    await this.auditService.log({
      userId: input.reviewerId,
      action: 'UPDATE',
      resource: 'DIAGNOSIS',
      resourceId: input.diagnosisId,
      metadata: { action: input.approve ? 'approved' : 'changes_requested' },
    });

    const updatedDiagnosis = await this.diagnosisRepository.findById(input.diagnosisId);
    return updatedDiagnosis!;
  }
}
