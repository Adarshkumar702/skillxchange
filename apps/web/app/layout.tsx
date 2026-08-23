import './globals.css';
import React from 'react';
import { Providers } from './providers';

export const metadata = {
  title: 'SkillXchange - Learn. Teach. Exchange. Grow.',
  description: 'AI-powered peer skill-sharing & career placement readiness platform for developers and university students.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-slate-100 antialiased min-h-screen flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
