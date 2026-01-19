import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { authApi } from "@/lib/api/endpoints";
import { LoginInput, RegisterInput } from "@/schemas/auth.schema";
import { toast } from "sonner";

export const useAuth = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const {
    user,
    isAuthenticated,
    setAuth,
    logout: logoutStore,
  } = useAuthStore();

  const { data: currentUser, isLoading } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const response = await authApi.getUserCurrent();
      return response.data.data;
    },
    enabled: isAuthenticated,
    retry: false,
  });

  const registerMutation = useMutation({
    mutationFn: (data: RegisterInput) => authApi.register(data),
    onSuccess: (response) => {
      const { user, accessToken, refreshToken } = response.data.data!;
      setAuth(user, accessToken, refreshToken);
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      toast.success("Account created success");
      router.push("/dashboard");
    },
  });

  const loginMutation = useMutation({
    mutationFn: (data: LoginInput) => authApi.login(data),
    onSuccess: (response) => {
      const { user, accessToken, refreshToken } = response.data.data!;
      setAuth(user, accessToken, refreshToken);
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      toast.success(`Welcome,  ${user.username}`);
      router.push("/dashboard");
    },
    onError: () => {
      logoutStore();
      queryClient.clear();
      router.push("/login");
    },
  });

  const logoutMutation = useMutation({
    mutationFn: (refreshToken: string) => authApi.logout(refreshToken),
    onSuccess: () => {
      logoutStore();
      queryClient.clear();
      router.push("/login");
    },
  });

  const logout = () => {
    const refreshToken = useAuthStore.getState().refreshToken;
    if (refreshToken) {
      logoutMutation.mutate(refreshToken);
    } else {
      logoutStore();
      queryClient.clear();
      router.push("/login");
    }
  };

  return {
    user: currentUser || user,
    isAuthenticated,
    isLoading,
    register: registerMutation.mutate,
    login: loginMutation.mutate,
    logout,
    isRegistering: registerMutation.isPending,
    isLoggingIn: loginMutation.isPending,
    registerError: registerMutation.error,
    loginError: loginMutation.error,
  };
};
