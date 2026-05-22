import { authAdapter } from "./authAdapter";
import type { AuthSession, LoginInput, SignupInput } from "../types/auth";

const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

export async function login(input: LoginInput): Promise<AuthSession> {
  await delay();
  return authAdapter.login(input);
}

export async function signup(input: SignupInput): Promise<AuthSession> {
  await delay();
  return authAdapter.signup(input);
}

export async function refreshSession(
  refreshToken: string,
): Promise<AuthSession> {
  await delay();
  return authAdapter.refresh(refreshToken);
}
