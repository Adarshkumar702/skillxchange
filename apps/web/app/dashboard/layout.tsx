'use client';

import React from 'react';
import { Navbar } from '../../components/navbar';
import { Sidebar } from '../../components/sidebar';
import { Footer } from '../../components/footer';
import { AIWidget } from '../../components/ai-widget';
import { IncomingCallBanner } from '../../components/incoming-call-banner';
import { useAuth } from '../../lib/authContext';
import { useRouter } from 'next/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 border-3 border-slate-400 border-t-slate-900 rounded-full animate-spin" />
          <p className="text-xs text-textMuted font-medium">Loading Workspace...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    if (typeof window !== 'undefined') {
      router.push('/login');
    }
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <IncomingCallBanner />
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
      <AIWidget />
      <Footer />
    </div>
  );
}
