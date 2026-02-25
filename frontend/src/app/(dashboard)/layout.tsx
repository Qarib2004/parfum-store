'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false); // состояние Sidebar

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="dashboard-layout">
      <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="dashboard-main" style={{ display: 'flex' }}>
        <Sidebar open={sidebarOpen} />

        <main style={{ flex: 1, padding: '1rem' }}>{children}</main>
      </div>
    </div>
  );
}