<template>
  <div
    @click="click"
    class="cursor-pointer py-1 px-2 rounded-md border-1 border-text/30 flex gap-2 items-center justify-between"
    :style="hex_color ? { borderColor: hex_color } : null"
  >
    <Transition name="slide-fade">
      <slot v-if="showIcon" name="icon"> </slot>
    </Transition>
    <div>
      {{ name }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";

const props = defineProps<{
  name: string;
  hex_color?: string | undefined;
  useConfirmClick?: boolean;
}>();

const emit = defineEmits<{
  click: [void];
}>();

const clicked = ref(false);
const showIcon = computed(() => {
  if (props.useConfirmClick) {
    return clicked.value;
  }
  return true;
});

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
.slide-fade-enter-active {
  transition: all 0.1s ease;
}

.slide-fade-leave-active {
  transition: all 0.1s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(100%);
  opacity: 0;
  width: 0;
}
</style>
