import { defineStore } from "pinia";

export const useCurrentTaskStore = defineStore("currentTask", {
  state: () => ({
    currentTask: null,
  }),
});
