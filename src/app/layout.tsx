// src/app/layout.tsx
import React from 'react';
import { Metadata } from 'next';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Portal do Cliente - Binove',
    template: '%s | Portal do Cliente - Binove',
  },
  description: 'Portal de gerenciamento e visualização de relatórios e dashboards do Power BI',
  keywords: ['dashboard', 'power bi', 'analytics', 'relatórios'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}