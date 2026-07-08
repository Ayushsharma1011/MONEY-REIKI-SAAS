import { create } from "zustand";

type UserProfile = {
  id: string;
  email: string;
  name?: string;
};

type UserState = {
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
};

export const useUserStore = create<UserState>((set) => ({
  user: null,
  setUser: (user) => set({ user })
}));
