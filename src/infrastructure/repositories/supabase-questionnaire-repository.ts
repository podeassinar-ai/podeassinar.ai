import {
    DiagnosticQuestionnaire,
    QuestionnaireAnswer,
} from '@domain/entities/questionnaire';
import { IQuestionnaireRepository } from '@domain/interfaces/questionnaire-repository';
import { SupabaseClient } from '@supabase/supabase-js';

interface QuestionnaireRow {
    id: string;
    transaction_id: string;
    answers: QuestionnaireAnswer[];
    completed_at: string | null;
    created_at: string;
    updated_at: string;
}

function toEntity(row: QuestionnaireRow): DiagnosticQuestionnaire {
    return {
        id: row.id,
        transactionId: row.transaction_id,
        answers: row.answers ?? [],
        completedAt: row.completed_at ? new Date(row.completed_at) : undefined,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
    };
}

export class SupabaseQuestionnaireRepository implements IQuestionnaireRepository {
    private tableName = 'questionnaires';

    constructor(private supabase: SupabaseClient) { }

    async create(questionnaire: DiagnosticQuestionnaire): Promise<DiagnosticQuestionnaire> {
        const { data, error } = await this.supabase
            .from(this.tableName)
            .insert({
                id: questionnaire.id,
                transaction_id: questionnaire.transactionId,
                answers: questionnaire.answers,
                completed_at: questionnaire.completedAt?.toISOString() ?? null,
            })
            .select()
            .single();

        if (error) throw new Error(`Failed to create questionnaire: ${error.message}`);
        return toEntity(data);
    }

    async findById(id: string): Promise<DiagnosticQuestionnaire | null> {
        const { data, error } = await this.supabase
            .from(this.tableName)
            .select()
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw new Error(`Failed to find questionnaire: ${error.message}`);
        }
        return toEntity(data);
    }

    async findByTransactionId(transactionId: string): Promise<DiagnosticQuestionnaire | null> {
        const { data, error } = await this.supabase
            .from(this.tableName)
            .select()
            .eq('transaction_id', transactionId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw new Error(`Failed to find questionnaire by transaction: ${error.message}`);
        }
        return toEntity(data);
    }

    async addAnswer(id: string, answer: QuestionnaireAnswer): Promise<DiagnosticQuestionnaire> {
        const questionnaire = await this.findById(id);
        if (!questionnaire) throw new Error('Questionnaire not found');

        const existingIndex = questionnaire.answers.findIndex(
            a => a.questionId === answer.questionId
        );
        const newAnswers = existingIndex >= 0
            ? questionnaire.answers.map((a, i) => i === existingIndex ? answer : a)
            : [...questionnaire.answers, answer];

        const { data, error } = await this.supabase
            .from(this.tableName)
            .update({
                answers: newAnswers,
                updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw new Error(`Failed to add answer: ${error.message}`);
        return toEntity(data);
    }

    async markComplete(id: string): Promise<DiagnosticQuestionnaire> {
        const { data, error } = await this.supabase
            .from(this.tableName)
            .update({
                completed_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw new Error(`Failed to mark questionnaire complete: ${error.message}`);
        return toEntity(data);
    }

    async delete(id: string): Promise<void> {
        const { error } = await this.supabase
            .from(this.tableName)
            .delete()
            .eq('id', id);

        if (error) throw new Error(`Failed to delete questionnaire: ${error.message}`);
    }
}
