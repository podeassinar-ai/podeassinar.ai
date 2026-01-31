import { DiagnosticQuestionnaire, QuestionnaireAnswer } from '../entities/questionnaire';

export interface IQuestionnaireRepository {
  create(questionnaire: DiagnosticQuestionnaire): Promise<DiagnosticQuestionnaire>;
  findById(id: string): Promise<DiagnosticQuestionnaire | null>;
  findByTransactionId(transactionId: string): Promise<DiagnosticQuestionnaire | null>;
  addAnswer(id: string, answer: QuestionnaireAnswer): Promise<DiagnosticQuestionnaire>;
  markComplete(id: string): Promise<DiagnosticQuestionnaire>;
  delete(id: string): Promise<void>;
}
