import { useMutation } from "@tanstack/react-query";
import { login, signup } from "../services/authService";
import { useAuthStore } from "../store/authStore";
import type { LoginInput, SignupInput } from "../types/auth";

export function useAuth() {
  const currentUser = useAuthStore((state) => state.currentUser);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const setLogin = useAuthStore((state) => state.login);
  const logout = useAuthStore((state) => state.logout);

  const loginMutation = useMutation({
    mutationFn: (input: LoginInput) => login(input),
    onSuccess: (session) => setLogin(session.member),
  });

  const signupMutation = useMutation({
    mutationFn: (input: SignupInput) => signup(input),
    onSuccess: (session) => setLogin(session.member),
  });

  return {
    currentUser,
    isLoggedIn,
    login: loginMutation,
    signup: signupMutation,
    logout,
  };
}
