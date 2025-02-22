import { defineStore } from "pinia";
import type { User } from "@supabase/supabase-js";

export const useUserStore = defineStore("user", {
  state: () => ({
    user: null as User | null,
  }),
});
