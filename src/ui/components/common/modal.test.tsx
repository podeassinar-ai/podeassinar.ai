// @vitest-environment jsdom

import React, { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal } from './modal';

describe('Modal', () => {
  it('traps focus and closes on Escape', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(
      <Modal isOpen onClose={onClose} title="Tem certeza?">
        <button type="button">Primeira ação</button>
        <button type="button">Segunda ação</button>
      </Modal>
    );

    const closeButton = screen.getByRole('button', { name: /fechar modal/i });
    expect(document.activeElement).toBe(closeButton);

    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: /primeira ação/i }));

    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: /segunda ação/i }));

    await user.tab();
    expect(document.activeElement).toBe(closeButton);

    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('focuses the provided initial focus ref', () => {
    const initialFocusRef = createRef<HTMLButtonElement>();

    render(
      <Modal isOpen onClose={() => {}} title="Confirmar" initialFocusRef={initialFocusRef}>
        <button ref={initialFocusRef} type="button">Confirmar</button>
        <button type="button">Cancelar</button>
      </Modal>
    );

    expect(document.activeElement).toBe(screen.getByRole('button', { name: /^confirmar$/i }));
  });
});
