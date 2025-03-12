import { defineStore } from "pinia";
import { ref } from "vue";
import { type Tag } from "../common/types";
import {
  getTags,
  createTag,
  deleteTag,
  updateTag as updateTagSupabase,
} from "../common/supabaseClient";

export const useTagsStore = defineStore("tags", () => {
  const tags = ref<Tag[]>([]);

  async function loadTags() {
    const data = await getTags();
    if (data) {
      tags.value = data;
    }
  }

  async function addTag(name: string): Promise<Tag | null> {
    if (tags.value.find((t) => t.name == name)) {
      return null;
    }

    const data = await createTag(name);
    if (data) {
      tags.value = [...(tags.value || []), data];
    }
    return data;
  }

  async function removeTag(id: string) {
    if (!tags.value.find((t) => t.id === id)) {
      return false;
    }

    const success = await deleteTag(id);
    if (success) {
      tags.value = tags.value?.filter((tag) => tag.id !== id);
    }
    return success;
  }

  async function updateTag(updatedTag: Tag): Promise<boolean> {
    const index = tags.value.findIndex((tag) => tag.id === updatedTag.id);
    if (index === -1) {
      return false;
    }

    // Optimistically update the tag in the store
    const oldTag = { ...tags.value[index] };
    tags.value[index] = updatedTag;

    // Update in the database
    const success = await updateTagSupabase(updatedTag);

    // Revert if the update failed
    if (!success) {
      tags.value[index] = oldTag;
    }

    return success;
  }

  return {
    tags,
    loadTags,
    addTag,
    removeTag,
    updateTag,
  };
});
