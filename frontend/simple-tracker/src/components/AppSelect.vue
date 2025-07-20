<template>
  <div class="flex gap-1 flex-wrap">
    <div
      v-for="(choice, index) in props.choices"
      :key="index"
      @click="toggleSelection(choice)"
      :class="{
        'bg-primary text-background': isSelected(choice),
      }"
      class="cursor-pointer py-1 px-2 rounded-md border-1 border-text/30"
    >
      {{ descriptions[index] || choice }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps({
  choices: {
    type: Array,
    required: true,
  },
  modelValue: {
    type: [String, Number, Array, Object],
    default: null,
  },
  multiple: {
    type: Boolean,
    default: false,
  },
  descriptions: {
    type: Array<String>,
    default: () => [],
  },
});

const emit = defineEmits(["update:modelValue"]);

const selected = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    emit("update:modelValue", value);
  },
});

const isSelected = (choice: any) => {
  if (props.multiple) {
    return (props.modelValue as any[])?.includes(choice);
  }
  return props.modelValue === choice;
};

const toggleSelectionSingle = (choice: any) => {
  if (props.modelValue !== choice) {
    selected.value = choice;
  }
};

const toggleSelectionMultiple = (choice: any) => {
  const selection = [...((props.modelValue as any[]) || [])];
  const index = selection.indexOf(choice);

  if (index > -1) {
    // It's selected, try to remove it
    if (selection.length > 1) {
      selection.splice(index, 1);
      selected.value = selection;
    }
  } else {
    // It's not selected, add it
    selection.push(choice);
    selected.value = selection;
  }
};

const toggleSelection = (choice: any) => {
  if (!props.multiple) {
    toggleSelectionSingle(choice);
  } else {
    toggleSelectionMultiple(choice);
  }
};
</script>
