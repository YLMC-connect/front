import { authAdapter } from "./authAdapter";
import { createAuthSessionManager } from "./authSessionService";
import { configureAuthRecovery } from "../lib/authRecovery";
import { secureTokenStore } from "../lib/secureStore";
import { useAuthStore } from "../store/authStore";
import type {
  AuthSession,
  LoginInput,
  MemberAvailability,
  MemberDuplicateInput,
  SignupInput,
} from "../types/auth";
import type { Member } from "../types/common";

const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

const sessionManager = createAuthSessionManager({
  adapter: authAdapter,
  tokenStore: secureTokenStore,
  state: {
    setRestoring: () => useAuthStore.getState().setRestoring(),
    setAuthenticated: (member) =>
      useAuthStore.getState().setAuthenticated(member),
    setAnonymous: () => useAuthStore.getState().setAnonymous(),
    setUnavailable: () => useAuthStore.getState().setUnavailable(),
  },
});

export async function login(input: LoginInput): Promise<AuthSession> {
  await delay();
  return sessionManager.login(input);
}

export async function checkMemberAvailability(
  input: MemberDuplicateInput,
): Promise<MemberAvailability> {
  await delay();
  return authAdapter.checkAvailability(input);
}

export async function signup(input: SignupInput): Promise<AuthSession> {
  await delay();
  return sessionManager.signup(input);
}

export async function refreshSession(): Promise<AuthSession> {
  return sessionManager.refresh();
}

export const restoreAuthSession = () => sessionManager.restore();
export const logout = () => sessionManager.logout();

export async function getCurrentMember(): Promise<Member> {
  const member = await authAdapter.getCurrentMember();
  useAuthStore.getState().setAuthenticated(member);
  return member;
}

export async function updateCurrentMember(input: {
  phone: string;
}): Promise<Member> {
  const member = await authAdapter.updateCurrentMember(input);
  useAuthStore.getState().updateProfile(member);
  return member;
}

export async function verifyPassword(input: {
  password: string;
}): Promise<boolean> {
  return authAdapter.verifyPassword(input);
}

export async function changePassword(input: {
  currentPassword: string;
  newPassword: string;
}): Promise<void> {
  return authAdapter.changePassword(input);
}

export async function withdrawMember(): Promise<void> {
  await authAdapter.withdraw();
  await logout();
}

configureAuthRecovery(async () => {
  await refreshSession();
});
