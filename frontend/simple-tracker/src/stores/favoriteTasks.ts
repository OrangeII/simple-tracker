import { defineStore } from "pinia";
import type { Task } from "../common/types";
import { ref } from "vue";
import { getFavorites } from "../common/supabaseClient";

export const useFavoriteTasksStore = defineStore("favoriteTasks", () => {
  const favorites = ref<Task[]>([]);

  const fetchFavorites = async () => {
    const data = await getFavorites();
    if (data) {
      favorites.value = data;
    }
  };

  function addFavorite(newFavorite: Task) {
    //skip duplicates
    if (favorites.value.some((t) => t.id === newFavorite.id)) return;

    favorites.value.push(newFavorite);
  }

  function removeFavorite(favorite: Task) {
    const index = favorites.value.findIndex((t) => t.id === favorite.id);
    if (index !== -1) {
      favorites.value.splice(index, 1);
    }
  }

  /**
   * if task is currently in the favourite list, remove it. Otherwise add it to the list.
   * @param task task to be toggled
   */
  function toggle(task: Task) {
    if (favorites.value.some((t) => t.id === task.id)) {
      removeFavorite(task);
    } else {
      addFavorite(task);
    }
  }

  return { favorites, fetchFavorites, addFavorite, removeFavorite, toggle };
});
