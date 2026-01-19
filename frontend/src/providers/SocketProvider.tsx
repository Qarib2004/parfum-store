'use client';

import { useEffect } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { useAuthStore } from '@/store/authStore';

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  const { isConnected } = useSocket();

  useEffect(() => {
    if (isAuthenticated && isConnected) {
      console.log('Socket Provider: Connected');
    }
  }, [isAuthenticated, isConnected]);

  return <>{children}</>;
}