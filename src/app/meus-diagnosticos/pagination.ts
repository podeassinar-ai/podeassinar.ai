interface BuildDiagnosticosPaginationParams {
  pageParam?: string;
  totalItems: number;
  pageSize: number;
  searchParams: Record<string, string | undefined>;
}

export function buildDiagnosticosPagination({
  pageParam,
  totalItems,
  pageSize,
  searchParams,
}: BuildDiagnosticosPaginationParams) {
  const rawPage = Number.parseInt(pageParam || '1', 10);
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Number.isFinite(rawPage) && rawPage > 0
    ? Math.min(rawPage, totalPages)
    : 1;

  const rangeStart = (currentPage - 1) * pageSize;
  const rangeEnd = rangeStart + pageSize - 1;

  const buildPageHref = (page: number) => {
    const nextParams = new URLSearchParams();
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value && key !== 'page') {
        nextParams.set(key, value);
      }
    });
    nextParams.set('page', String(page));
    return `/meus-diagnosticos?${nextParams.toString()}`;
  };

  return {
    currentPage,
    totalPages,
    pageSize,
    rangeStart,
    rangeEnd,
    hasPreviousPage: currentPage > 1,
    hasNextPage: currentPage < totalPages,
    buildPageHref,
  };
}
