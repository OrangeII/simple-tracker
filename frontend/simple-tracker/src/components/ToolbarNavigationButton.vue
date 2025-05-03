<template>
  <div class="flex flex-col items-center gap-1 grow">
    <component
      :is="icon"
      class="text-primary size-8 cursor-pointer"
      @click="onClick"
    />
    <div
      v-if="isActive"
      class="w-full h-[2px] bg-primary"
      :class="[isMobile ? 'mt-2' : '']"
    ></div>
  </div>
</template>

<script setup lang="ts">
import type { FunctionalComponent, HTMLAttributes, VNodeProps } from "vue";
import { useBreakpoints } from "../common/breakpoints";

const { isMobile } = useBreakpoints();

defineProps<{
  icon: FunctionalComponent<HTMLAttributes & VNodeProps>;
  isActive: boolean;
}>();

const emit = defineEmits<{
  click: [];
}>();

const onClick = () => {
  emit("click");
};
</script>
