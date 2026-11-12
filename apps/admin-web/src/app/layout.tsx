import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'YOOBIC ONE - Enterprise Frontline Operations',
  description: 'Enterprise Operations, Training, and Frontline Communication Platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 antialiased">{children}</body>
    </html>
  );
}
