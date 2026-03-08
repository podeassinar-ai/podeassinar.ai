'use client';

import { Button } from '@ui/components/common';

export function PrintReportButton() {
  return (
    <Button variant="secondary" className="gap-2 no-print" onClick={() => window.print()}>
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
      Baixar PDF
    </Button>
  );
}
