<template>
  <div
    ref="tagElement"
    @click="click"
    class="relative cursor-pointer py-1 px-2 rounded-md border-1 border-text/30 flex items-center justify-between"
    :style="hex_color ? { borderColor: hex_color } : null"
    :class="{ 'gap-2': hasIcon && showIcon }"
  >
    <div :class="['icon-container', { 'icon-visible': showIcon }]">
      <slot name="icon"></slot>
    </div>
    <div>
      {{ name }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from "vue";

const slots = defineSlots<{
  icon?: () => any;
}>();
const hasIcon = computed(() => {
  return slots.icon && slots.icon().length > 0;
});

const props = defineProps<{
  name: string;
  hex_color?: string | undefined;
  useConfirmClick?: boolean;
}>();

const emit = defineEmits<{
  click: [void];
}>();

const tagElement = ref<HTMLElement | null>(null);

const clicked = ref(false);
const showIcon = computed(() => {
  if (props.useConfirmClick) {
    return clicked.value;
  }
  return true;
});
const renderClickThrough = computed(() => {
  return props.useConfirmClick && clicked.value;
});
watch(renderClickThrough, (isTrue) => {
  if (isTrue) {
    // use timeout to ensure the click-through div is rendered before adding the event listener
    setTimeout(() => {
      document.addEventListener("click", handleDocumentClick, {
        capture: true,
      });
    }, 0);
  } else {
    document.removeEventListener("click", handleDocumentClick, {
      capture: true,
    });
  }
});
onUnmounted(() => {
  // Cleanup listener when component is unmounted
  document.removeEventListener("click", handleDocumentClick, true);
});
const handleDocumentClick = (event: MouseEvent) => {
  if (tagElement.value && !tagElement.value.contains(event.target as Node)) {
    clicked.value = false;
  }
};

const click = () => {
  if (props.useConfirmClick) {
    if (clicked.value) {
      emit("click");
      clicked.value = false;
    } else {
      clicked.value = true;
    }
    return;
  }

  emit("click");
};
</script>

<style scoped>
.icon-container {
  transform: translateX(-100%);
  opacity: 0;
  overflow: hidden;
  max-width: 0;
  transition: transform 0.1s ease, opacity 0.1s ease, max-width 0.1s ease;
}

.icon-container.icon-visible {
  transform: translateX(0);
  opacity: 1;
  max-width: 3em;
}
</style>
