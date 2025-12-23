import type { LoginDto } from "@/types/api";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { authApi } from "@/services/api";
import { useAuthStore } from "@/stores/auth";

/**
 * Hook for wallet login
 */
export function useLogin() {
  const { login } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LoginDto) => authApi.login(data),
    onSuccess: (response) => {
      login(response);
      // Invalidate queries that depend on auth
      queryClient.invalidateQueries({ queryKey: ["agents"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

/**
 * Hook for logout
 */
export function useLogout() {
  const { logout } = useAuthStore();
  const queryClient = useQueryClient();

  return () => {
    logout();
    // Clear all cached queries
    queryClient.clear();
  };
}

/**
 * Hook for getting current user profile
 */
export function useProfile() {
  const { isAuthenticated, setUser } = useAuthStore();

  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const user = await authApi.getProfile();

      setUser(user);

      return user;
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook for checking if user is authenticated
 */
export function useIsAuthenticated() {
  const { isAuthenticated, user } = useAuthStore();

  return { isAuthenticated, user };
}
