import { create } from "zustand";
import type { Member } from "../types/common";
import type { AuthStatus } from "../types/auth";

interface AuthState {
  currentUser: Member | null;
  isLoggedIn: boolean;
  status: AuthStatus;
  setRestoring: () => void;
  setAuthenticated: (member: Member) => void;
  setAnonymous: () => void;
  setUnavailable: () => void;
  updateProfile: (patch: Partial<Member>) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  currentUser: null,
  isLoggedIn: false,
  status: "restoring",
  setRestoring: () => set({ status: "restoring" }),
  setAuthenticated: (member) =>
    set({ currentUser: member, isLoggedIn: true, status: "authenticated" }),
  setAnonymous: () =>
    set({ currentUser: null, isLoggedIn: false, status: "anonymous" }),
  setUnavailable: () =>
    set({ currentUser: null, isLoggedIn: false, status: "unavailable" }),
  updateProfile: (patch) =>
    set((state) => ({
      currentUser: state.currentUser
        ? { ...state.currentUser, ...patch }
        : state.currentUser,
    })),
}));
