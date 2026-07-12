import { useMutation } from "@tanstack/react-query";
import {
  checkMemberAvailability,
  login,
  logout as logoutSession,
  signup,
} from "../services/authService";
import { useAuthStore } from "../store/authStore";
import type {
  LoginInput,
  MemberDuplicateInput,
  SignupInput,
} from "../types/auth";

export function useAuth() {
  const currentUser = useAuthStore((state) => state.currentUser);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const status = useAuthStore((state) => state.status);

  const loginMutation = useMutation({
    mutationFn: (input: LoginInput) => login(input),
  });

  const availabilityMutation = useMutation({
    mutationFn: (input: MemberDuplicateInput) => checkMemberAvailability(input),
  });

  const signupMutation = useMutation({
    mutationFn: (input: SignupInput) => signup(input),
  });

  return {
    currentUser,
    isLoggedIn,
    status,
    checkAvailability: availabilityMutation,
    login: loginMutation,
    signup: signupMutation,
    logout: logoutSession,
  };
}
