<template>
  <div class="relative">
    <input
      type="text"
      class="w-full font-medium text-lg focus:outline-none focus:border-none"
      :placeholder="placeholder"
      v-model="inputValue"
    />

    <div
      v-if="showDropdown"
      :class="[
        dropdownPosition === 'above' ? 'bottom-full mb-1' : 'top-full mt-1',
        'absolute left-0 w-full z-10',
      ]"
    >
      <div
        class="max-h-48 overflow-y-auto rounded-md grainy bg-background dark:bg-blend-overlay flex flex-wrap gap-y-2 py-2 px-1"
      >
        <div
          v-if="!hasExactMatch"
          class="mx-1 py-1 px-2 rounded-md border-1 border-text/30 flex gap-1 items-center justify-between"
          @click="emit('submit', { value: inputValue, matchCount: 0 })"
        >
          <PlusCircleIcon class="size-6 text-primary"></PlusCircleIcon>
          <div>{{ inputValue }}</div>
        </div>
        <div
          v-for="item in filteredItems"
          :key="getItemKey(item)"
          class="mx-1 py-1 px-2 rounded-md border-1 border-text/30"
          @click="handleSelect(item)"
        >
          {{ item[searchBy] }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { PlusCircleIcon } from "@heroicons/vue/24/solid";

interface TextSelectProps {
  items: any[];
  searchBy: string;
  itemKey: string;
  placeholder?: string;
  dropdownPosition?: "above" | "below";
  debounceMs?: number;
}

interface TextSelectEmits {
  (event: "select", item: any): void;
  (event: "submit", payload: { value: string; matchCount: number }): void;
}

const N_CHARS = 1;

const props = withDefaults(defineProps<TextSelectProps>(), {
  placeholder: "",
  dropdownPosition: "below",
  debounceMs: 300,
});

const emit = defineEmits<TextSelectEmits>();

const inputValue = ref("");
const showDropdown = ref(false);

const hasExactMatch = computed(() => {
  return (
    filteredItems.value.find(
      (e) => e[props.searchBy].toLowerCase() == inputValue.value.toLowerCase()
    ) !== undefined
  );
});

const filteredItems = computed(() => {
  if (!inputValue.value || inputValue.value.length < N_CHARS) {
    return [];
  }

  //search is not case sensitive
  const searchTerm = inputValue.value.toLocaleLowerCase();
  return props.items.filter((item) =>
    item[props.searchBy].toLowerCase().includes(searchTerm)
  );
});

watch(inputValue, (newValue: string) => {
  showDropdown.value = newValue.length >= N_CHARS;
});

const getItemKey = (item: any) => {
  return item[props.itemKey];
};

const handleSelect = (item: any) => {
  inputValue.value = item[props.searchBy];
  showDropdown.value = false;
  emit("select", item);
};
</script>
