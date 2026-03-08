import { describe, expect, it } from 'vitest';
import { buildDiagnosticosPagination } from './pagination';

describe('buildDiagnosticosPagination', () => {
  it('normalizes invalid page params to page 1 and preserves other params', () => {
    const result = buildDiagnosticosPagination({
      pageParam: 'foo',
      totalItems: 25,
      pageSize: 10,
      searchParams: { success: 'true', page: 'foo' },
    });

    expect(result.currentPage).toBe(1);
    expect(result.totalPages).toBe(3);
    expect(result.rangeStart).toBe(0);
    expect(result.rangeEnd).toBe(9);
    expect(result.buildPageHref(2)).toBe('/meus-diagnosticos?success=true&page=2');
  });

  it('clamps the page to the last available page', () => {
    const result = buildDiagnosticosPagination({
      pageParam: '99',
      totalItems: 12,
      pageSize: 10,
      searchParams: {},
    });

    expect(result.currentPage).toBe(2);
    expect(result.rangeStart).toBe(10);
    expect(result.rangeEnd).toBe(19);
  });
});
