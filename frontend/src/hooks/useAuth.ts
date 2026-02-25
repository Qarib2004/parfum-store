import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/lib/api/endpoints';
import { LoginInput, RegisterInput } from '@/schemas/auth.schema';
import { useEffect, useState } from 'react';

export const useAuth = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isAuthenticated, setAuth, logout: logoutStore } = useAuthStore();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token && !isAuthenticated) {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    }
    setIsInitialized(true);
  }, []);

  const { data: currentUser, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const response = await authApi.getUserCurrent();
      return response.data.data;
    },
    enabled: isAuthenticated && !!localStorage.getItem('accessToken'),
    retry: false,
  });

  const registerMutation = useMutation({
    mutationFn: (data: RegisterInput) => authApi.register(data),
    onSuccess: (response) => {
      const { user, accessToken, refreshToken } = response.data.data!;
      setAuth(user, accessToken, refreshToken);
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      router.push('/dashboard');
    },
  });

  const loginMutation = useMutation({
    mutationFn: (data: LoginInput) => authApi.login(data),
    onSuccess: (response) => {
      const { user, accessToken, refreshToken } = response.data.data!;
      setAuth(user, accessToken, refreshToken);
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      router.push('/dashboard');
    },
  });

  const logoutMutation = useMutation({
    mutationFn: (refreshToken: string) => authApi.logout(refreshToken),
    onSuccess: () => {
      logoutStore();
      queryClient.clear();
      router.push('/login');
    },
    onError: () => {
      logoutStore();
      queryClient.clear();
      router.push('/login');
    },
  });

  const logout = () => {
    const refreshToken = useAuthStore.getState().refreshToken;
    if (refreshToken) {
      logoutMutation.mutate(refreshToken);
    } else {
      logoutStore();
      queryClient.clear();
      router.push('/login');
    }
  };

  return {
    user: currentUser || user,
    isAuthenticated: isAuthenticated && !!localStorage.getItem('accessToken'),
    isLoading: !isInitialized || isLoading,
    register: registerMutation.mutate,
    login: loginMutation.mutate,
    logout,
    isRegistering: registerMutation.isPending,
    isLoggingIn: loginMutation.isPending,
    registerError: registerMutation.error,
    loginError: loginMutation.error,
  };
};