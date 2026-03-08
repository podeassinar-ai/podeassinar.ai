// @vitest-environment jsdom

import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Select } from './select';

describe('Select', () => {
  it('opens with keyboard and selects an option with Enter', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <Select
        label="Tipo do imóvel"
        value=""
        onChange={onChange}
        options={[
          { value: 'apartamento', label: 'Apartamento' },
          { value: 'casa', label: 'Casa' },
        ]}
      />
    );

    const trigger = screen.getByRole('button', { name: /tipo do imóvel/i });
    trigger.focus();

    await user.keyboard('{ArrowDown}');
    expect(screen.queryByRole('listbox')).not.toBeNull();

    await user.keyboard('{ArrowDown}{Enter}');
    expect(onChange).toHaveBeenCalledWith({ target: { value: 'casa' } });
    expect(document.activeElement).toBe(trigger);
  });

  it('closes on Escape', async () => {
    const user = userEvent.setup();

    render(
      <Select
        label="Status"
        value=""
        options={[
          { value: 'sim', label: 'Sim' },
          { value: 'nao', label: 'Não' },
        ]}
      />
    );

    const trigger = screen.getByRole('button', { name: /status/i });
    trigger.focus();

    await user.keyboard('{Enter}');
    expect(screen.queryByRole('listbox')).not.toBeNull();

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('listbox')).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });
});
