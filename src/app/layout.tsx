import type { Metadata } from 'next';
import { ToastProvider } from '@ui/components/common';
import '@ui/styles/globals.css';

export const metadata: Metadata = {
  title: 'PodeAssinar.ai - Diagnóstico Jurídico Imobiliário',
  description: 'Plataforma jurídica imobiliária com diagnóstico assistido por IA',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
