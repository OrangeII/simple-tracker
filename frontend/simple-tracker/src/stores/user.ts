import { defineStore } from "pinia";
import type { User } from "../common/types";

export const useUserStore = defineStore("user", {
  state: () => ({
    user: null as User | null,
  }),
});
