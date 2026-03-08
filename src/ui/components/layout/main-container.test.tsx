// @vitest-environment jsdom

import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import { MainContainer } from './main-container';

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe('MainContainer', () => {
  afterEach(() => cleanup());

  it('renders breadcrumbs when provided', () => {
    render(
      <MainContainer
        title="Minhas Análises"
        breadcrumbs={[
          { label: 'Início', href: '/' },
          { label: 'Diagnósticos' },
        ]}
      >
        <div>Conteúdo</div>
      </MainContainer>
    );

    const breadcrumbNav = screen.getByRole('navigation', { name: /breadcrumb/i });
    expect(breadcrumbNav).not.toBeNull();
    expect(within(breadcrumbNav).getByText('Início')).not.toBeNull();
    expect(within(breadcrumbNav).getByText('Diagnósticos')).not.toBeNull();
  });

  it('omits breadcrumbs when none are provided', () => {
    render(
      <MainContainer title="Sem trilha">
        <div>Conteúdo</div>
      </MainContainer>
    );

    expect(screen.queryByRole('navigation', { name: /breadcrumb/i })).toBeNull();
  });
});
