// @vitest-environment jsdom

import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { TransactionStatusProgress } from './transaction-status-progress';

describe('TransactionStatusProgress', () => {
  afterEach(() => cleanup());

  it('marks the current processing stage', () => {
    render(<TransactionStatusProgress status="PROCESSING" compact />);

    expect(screen.getByText('Análise IA')).not.toBeNull();
    expect(screen.getByText('Pagamento')).not.toBeNull();
  });

  it('shows a completed label when the transaction is finished', () => {
    render(<TransactionStatusProgress status="COMPLETED" compact />);

    expect(screen.getByText('Concluído')).not.toBeNull();
  });
});
