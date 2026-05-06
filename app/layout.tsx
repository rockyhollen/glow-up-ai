import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Glow-Up AI for Men',
  description: 'Personalized AI appearance optimization reports for men.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
