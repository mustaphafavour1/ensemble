"use client";

import { create } from "zustand";
import type { RoleId } from "@/lib/roles";

interface AppState {
  role: RoleId;
  setRole: (role: RoleId) => void;
  seeded: boolean;
  setSeeded: (seeded: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  role: "product-admin",
  setRole: (role) => set({ role }),
  seeded: true,
  setSeeded: (seeded) => set({ seeded }),
}));
