// @vitest-environment jsdom

import React from 'react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PaymentStep } from './PaymentStep';

const {
  pushMock,
  checkSubscriptionCreditsActionMock,
  consumeSubscriptionCreditActionMock,
} = vi.hoisted(() => ({
  pushMock: vi.fn(),
  checkSubscriptionCreditsActionMock: vi.fn(),
  consumeSubscriptionCreditActionMock: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

vi.mock('../../actions/subscription-actions', () => ({
  checkSubscriptionCreditsAction: checkSubscriptionCreditsActionMock,
  consumeSubscriptionCreditAction: consumeSubscriptionCreditActionMock,
}));

describe('PaymentStep', () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    checkSubscriptionCreditsActionMock.mockResolvedValue({
      hasActiveSubscription: true,
      hasAvailableCredits: true,
      remainingCredits: 3,
      totalCredits: 5,
      planName: 'Plano Pro',
    });
  });

  it('asks for confirmation before consuming a credit', async () => {
    const user = userEvent.setup();
    const addToast = vi.fn();

    render(
      <PaymentStep
        transactionId="tx-1"
        matriculaOption=""
        loading={false}
        setLoading={() => {}}
        onPaymentClick={() => {}}
        addToast={addToast}
      />
    );

    await screen.findByText(/usar crédito do plano/i);
    await user.click(screen.getAllByRole('button', { name: /usar 1 crédito/i })[0]);

    const dialog = await screen.findByRole('dialog', { name: /confirmar uso do crédito/i });
    expect(within(dialog).getByText(/você tem/i)).not.toBeNull();

    await user.click(screen.getByRole('button', { name: /manter pagamento normal/i }));
    expect(screen.queryByRole('dialog', { name: /confirmar uso do crédito/i })).toBeNull();
  });

  it('consumes the credit after confirmation and redirects', async () => {
    const user = userEvent.setup();
    const addToast = vi.fn();
    consumeSubscriptionCreditActionMock.mockResolvedValue({
      success: true,
      message: 'ok',
    });

    render(
      <PaymentStep
        transactionId="tx-1"
        matriculaOption=""
        loading={false}
        setLoading={() => {}}
        onPaymentClick={() => {}}
        addToast={addToast}
      />
    );

    await screen.findByText(/usar crédito do plano/i);
    await user.click(screen.getAllByRole('button', { name: /usar 1 crédito/i })[0]);
    await user.click(screen.getByRole('button', { name: /confirmar uso do crédito/i }));

    await waitFor(() => {
      expect(consumeSubscriptionCreditActionMock).toHaveBeenCalledWith('tx-1');
    });
    expect(addToast).toHaveBeenCalledWith('Crédito utilizado com sucesso! Sua análise será processada.', 'success');
    expect(pushMock).toHaveBeenCalledWith('/meus-diagnosticos');
  });
});
