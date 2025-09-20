<template>
  <div class="relative">
    <input
      type="text"
      class="w-full p-2 grainy font-medium text-lg focus:outline-none"
      :class="[
        showDropdown
          ? dropdownPosition === 'above'
            ? 'rounded-b-md'
            : 'rounded-t-md'
          : 'rounded-md',
      ]"
      :placeholder="placeholder"
      v-model="inputValue"
    />

    <div
      v-if="showDropdown"
      :class="[
        dropdownPosition === 'above' ? 'bottom-full' : 'top-full',
        'absolute left-0 w-full z-10',
      ]"
    >
      <div
        class="max-h-48 overflow-y-auto grainy flex flex-wrap gap-y-2 py-2 px-1"
        :class="[
          dropdownPosition === 'above' ? 'rounded-t-md' : 'rounded-b-md',
        ]"
      >
        <div
          v-if="showAddNew && !hasExactMatch"
          class="bg-background mx-1 py-1 px-2 rounded-md border-1 border-text/30 flex gap-2 items-center justify-between"
          @click="submit"
        >
          <PlusCircleIcon class="size-6 text-primary"></PlusCircleIcon>
          <div>{{ inputValue }}</div>
        </div>
        <div
          v-for="item in filteredItems"
          :key="getItemKey(item)"
          class="cursor-pointer bg-background mx-1 py-1 px-2 rounded-md border-1 border-text/30"
          :style="item.hex_color ? { borderColor: item.hex_color } : null"
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
  modelValue?: string;
  items: any[];
  exclude?: any[];
  searchBy: string;
  itemKey: string;
  placeholder?: string;
  dropdownPosition?: "above" | "below";
  debounceMs?: number;
  showAddNew: boolean;
}

interface TextSelectEmits {
  (event: "select", item: any): void;
  (event: "submit", payload: { value: string; matchCount: number }): void;
  (event: "update:modelValue", value: string): void;
}

const N_CHARS = 1;
const localValue = ref("");

const props = withDefaults(defineProps<TextSelectProps>(), {
  placeholder: "",
  dropdownPosition: "below",
  debounceMs: 300,
});

const emit = defineEmits<TextSelectEmits>();

const inputValue = computed({
  get: () => props.modelValue ?? localValue.value,
  set: (value) => {
    localValue.value = value;
    emit("update:modelValue", value);
  },
});
const showDropdown = ref(false);

const hasExactMatch = computed(() => {
  return (
    filteredItems.value.find(
      (e) => e[props.searchBy].toLowerCase() == inputValue.value.toLowerCase()
    ) !== undefined ||
    props.exclude === undefined ||
    props.exclude.find(
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
  let filtered = props.items.filter((item) =>
    item[props.searchBy].toLowerCase().trim().includes(searchTerm)
  );

  filtered = filtered.filter((item) => {
    if (props.exclude !== undefined)
      return !props.exclude.some(
        (excludeItem) =>
          excludeItem[props.searchBy].toLowerCase().trim() ===
          item[props.searchBy].toLowerCase().trim()
      );
    else return true;
  });

  return filtered;
});

watch(inputValue, (newValue: string) => {
  showDropdown.value =
    newValue.length >= N_CHARS &&
    (filteredItems.value.length > 0 || !hasExactMatch.value);
});

const getItemKey = (item: any) => {
  return item[props.itemKey];
};

const handleSelect = (item: any) => {
  inputValue.value = "";
  showDropdown.value = false;
  emit("select", item);
};

const submit = () => {
  emit("submit", { value: inputValue.value, matchCount: 0 });
  inputValue.value = "";
  showDropdown.value = false;
};
</script>
