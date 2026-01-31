export interface QuestionnaireAnswer {
  questionId: string;
  value: string | string[] | boolean | number;
}

export interface DiagnosticQuestionnaire {
  id: string;
  transactionId: string;
  answers: QuestionnaireAnswer[];
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export function createQuestionnaire(params: {
  id: string;
  transactionId: string;
}): DiagnosticQuestionnaire {
  const now = new Date();
  return {
    id: params.id,
    transactionId: params.transactionId,
    answers: [],
    createdAt: now,
    updatedAt: now,
  };
}

export function addAnswer(
  questionnaire: DiagnosticQuestionnaire,
  answer: QuestionnaireAnswer
): DiagnosticQuestionnaire {
  const existingIndex = questionnaire.answers.findIndex(
    a => a.questionId === answer.questionId
  );

  const newAnswers = existingIndex >= 0
    ? questionnaire.answers.map((a, i) => i === existingIndex ? answer : a)
    : [...questionnaire.answers, answer];

  return {
    ...questionnaire,
    answers: newAnswers,
    updatedAt: new Date(),
  };
}

export function isComplete(questionnaire: DiagnosticQuestionnaire): boolean {
  return questionnaire.completedAt !== undefined;
}
