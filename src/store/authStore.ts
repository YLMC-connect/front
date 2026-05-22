import { create } from "zustand";
import type { Member } from "../types/common";
import { MOCK_USER } from "../mocks/auth";

interface AuthState {
  currentUser: Member | null;
  isLoggedIn: boolean;
  login: (member: Member) => void;
  logout: () => void;
  updateProfile: (patch: Partial<Member>) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  currentUser: MOCK_USER,
  isLoggedIn: true,
  login: (member) => set({ currentUser: member, isLoggedIn: true }),
  logout: () => set({ currentUser: null, isLoggedIn: false }),
  updateProfile: (patch) =>
    set((state) => ({
      currentUser: state.currentUser
        ? { ...state.currentUser, ...patch }
        : state.currentUser,
    })),
}));
