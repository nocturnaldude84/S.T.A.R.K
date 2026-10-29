import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'S.T.A.R.K. | Personal Intelligence System',
  description: 'System for Thinking, Analysis, Research and Knowledge.',
  applicationName: 'S.T.A.R.K.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
