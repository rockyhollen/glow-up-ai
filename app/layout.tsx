import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Glow-Up AI for Men',
  description: 'Personalized AI appearance optimization reports for men.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name='impact-site-verification' content='b3aa0182-49b5-4a73-aac3-9749b38f7bf9' />
      </head>
      <body>{children}</body>
    </html>
  );
}