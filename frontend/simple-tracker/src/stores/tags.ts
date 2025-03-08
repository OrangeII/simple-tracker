import { defineStore } from "pinia";
import { ref } from "vue";
import { type Tag } from "../common/types";
import { getTags, createTag, deleteTag } from "../common/supabaseClient";

export const useTagsStore = defineStore("tags", () => {
  const tags = ref<Tag[]>([]);

  async function loadTags() {
    const data = await getTags();
    if (data) {
      tags.value = data;
    }
  }

  async function addTag(tag: Tag) {
    if (tags.value.find((t) => (t.id = tag.id))) {
      return;
    }

    const data = await createTag(tag);
    if (data) {
      tags.value = [...(tags.value || []), data];
    }
  }

  async function removeTag(id: string) {
    if (!tags.value.find((t) => (t.id = id))) {
      return;
    }

    const success = await deleteTag(id);
    if (success) {
      tags.value = tags.value?.filter((tag) => tag.id !== id);
    }
  }

  return {
    tags,
    loadTags,
    addTag,
    removeTag,
  };
});
