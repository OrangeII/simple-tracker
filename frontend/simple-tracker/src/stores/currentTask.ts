import { defineStore } from "pinia";
import type { CurrentTask } from "../common/types";

export const useCurrentTaskStore = defineStore("currentTask", {
  state: () => ({
    task: null as CurrentTask | null,
  }),
});
