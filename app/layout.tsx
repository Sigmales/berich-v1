import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BERICH - Pronostics Sportifs',
  description: 'Plateforme de pronostics sportifs gagnants',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}