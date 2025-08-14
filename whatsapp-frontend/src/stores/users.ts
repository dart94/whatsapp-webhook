// src/store/users.ts
import { create } from "zustand";
import { shallow } from "zustand/shallow";
import type { User } from "@/types/user";

type UsersState = {
  users: User[];
  isLoading: boolean;
  error: string | null;
  // acciones
  set: (list: User[]) => void;
  add: (u: User) => void;
  update: (id: string, patch: Partial<User>) => void;
  remove: (id: string) => void;
  clear: () => void;
};

export const useUsersStore = create<UsersState>((set, get) => ({
  users: [],
  isLoading: false,
  error: null,

  set: (list) => set({ users: list }),

  add: (u) =>
    set((s) => {
      // evita duplicados por id (fallback por email)
      const exists = s.users.some(
        (x) => (u.id && x.id === u.id) || (!!u.email && x.email === u.email)
      );
      if (exists) {
        // si ya existe, lo reemplazamos (upsert)
        const users = s.users.map((x) =>
          (u.id && x.id === u.id) || (!!u.email && x.email === u.email) ? { ...x, ...u } : x
        );
        return { users };
      }
      return { users: [u, ...s.users] };
    }),

  update: (id, patch) =>
    set((s) => ({
      users: s.users.map((x) => (x.id === id ? { ...x, ...patch } : x)),
    })),

  remove: (id) => set((s) => ({ users: s.users.filter((x) => x.id !== id) })),
  clear: () => set({ users: [] }),
}));


