import { defineStore } from "pinia";
import type { Task } from "../common/types";
import { ref } from "vue";
import { getFavorites } from "../common/supabaseClient";
import { useTasksStore } from "./tasks";

export const useFavoriteTasksStore = defineStore("favoriteTasks", () => {
  const favorites = ref<Task[]>([]);
  const tasksStore = useTasksStore();

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

    try {
      //update the task on the backend
      await tasksStore.update(newFavorite);
    } catch (error) {
      //revert
      const index = favorites.value.findIndex((t) => t.id === newFavorite.id);
      favorites.value.splice(index, 1);
      newFavorite.is_favorite = false;
      throw new Error("Failed to add favorite task");
    }
  }

  async function removeFavorite(favorite: Task) {
    const index = favorites.value.findIndex((t) => t.id === favorite.id);
    if (index !== -1) {
      const del = favorites.value.splice(index, 1);
      del[0].is_favorite = false;

      try {
        //update the task on the backend
        await tasksStore.update(del[0]);
      } catch (error) {
        //revert
        favorites.value.splice(index, 0, del[0]);
        del[0].is_favorite = true;
        throw new Error("Failed to remove favorite task");
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
