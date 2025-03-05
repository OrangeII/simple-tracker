import { defineStore } from "pinia";
import type { Task } from "../common/types";
import { ref } from "vue";
import { getFavorites, updateTask } from "../common/supabaseClient";
import { useEntriesListStore } from "./entriesList";

export const useFavoriteTasksStore = defineStore("favoriteTasks", () => {
  const favorites = ref<Task[]>([]);
  const entriesListStore = useEntriesListStore();

  const fetchFavorites = async () => {
    const data = await getFavorites();
    if (data) {
      favorites.value = data;
    }
  };

  async function addFavorite(newFavorite: Task) {
    //skip duplicates
    if (favorites.value.some((t) => t.id === newFavorite.id)) return;
    newFavorite.is_favorite = true;
    favorites.value.push(newFavorite);
    entriesListStore.updateTask(newFavorite);

    if (!(await updateTask(newFavorite))) {
      //revert
      const index = favorites.value.findIndex((t) => t.id === newFavorite.id);
      favorites.value.splice(index, 1);
      newFavorite.is_favorite = false;
    }
  }

  async function removeFavorite(favorite: Task) {
    const index = favorites.value.findIndex((t) => t.id === favorite.id);
    if (index !== -1) {
      const del = favorites.value.splice(index, 1);
      del[0].is_favorite = false;
      entriesListStore.updateTask(del[0]);
      if (!(await updateTask(del[0]))) {
        //revert
        favorites.value.splice(index, 0, del[0]);
        del[0].is_favorite = true;
      }
    }
  }

  /**
   * if task is currently in the favourite list, remove it. Otherwise add it to the list.
   * @param task task to be toggled
   */
  async function toggle(task: Task) {
    if (favorites.value.some((t) => t.id === task.id)) {
      await removeFavorite(task);
    } else {
      await addFavorite(task);
    }
  }

  return { favorites, fetchFavorites, addFavorite, removeFavorite, toggle };
});
