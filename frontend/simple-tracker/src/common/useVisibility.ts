import { onMounted, onUnmounted, ref } from "vue";

export function useVisibility() {
  const isVisible = ref<Boolean>(true);

  onMounted(() => {
    document.addEventListener("visibilitychange", handleVisibilityChange);
  });

  onUnmounted(() => {
    document.removeEventListener("visibilitychange", handleVisibilityChange);
  });

  const handleVisibilityChange = () => {
    if (document.hidden) {
      isVisible.value = false;
    } else {
      isVisible.value = true;
    }
  };

  return {
    isVisible,
  };
}
