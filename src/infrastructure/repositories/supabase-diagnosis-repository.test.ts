import { describe, expect, it, vi } from 'vitest';
import { SupabaseDiagnosisRepository } from './supabase-diagnosis-repository';

describe('SupabaseDiagnosisRepository.findPendingReview', () => {
  it('queries only ai generated diagnoses', async () => {
    const single = {
      order: vi.fn().mockResolvedValue({ data: [], error: null }),
    };
    const select = {
      in: vi.fn().mockReturnValue(single),
    };
    const from = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue(select),
    });
    const supabase = { from };

    const repository = new SupabaseDiagnosisRepository(supabase as any);
    await repository.findPendingReview();

    expect(from).toHaveBeenCalledWith('diagnoses');
    expect(select.in).toHaveBeenCalledWith('status', ['AI_GENERATED']);
  });
});
