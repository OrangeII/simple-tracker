import { onMounted, onUnmounted, ref } from "vue";

export function useVisibility() {
  const isVisible = ref<Boolean>(true);

  const visibleCallbacks: Array<() => void> = [];
  const hiddenCallbacks: Array<() => void> = [];

  onMounted(() => {
    document.addEventListener("visibilitychange", handleVisibilityChange);
  });

  onUnmounted(() => {
    document.removeEventListener("visibilitychange", handleVisibilityChange);
  });

  const handleVisibilityChange = () => {
    if (document.hidden) {
      isVisible.value = false;
      hiddenCallbacks.forEach((callback) => callback());
    } else {
      isVisible.value = true;
      visibleCallbacks.forEach((callback) => callback());
    }
  };

  const onVisibilityChange = (
    onVisible?: () => void,
    onHidden?: () => void
  ) => {
    if (onVisible) {
      visibleCallbacks.push(onVisible);
    }
    if (onHidden) {
      hiddenCallbacks.push(onHidden);
    }

    //return a function to remove the callbacks
    return () => {
      if (onVisible) {
        const index = visibleCallbacks.indexOf(onVisible);
        if (index > -1) {
          visibleCallbacks.splice(index, 1);
        }
      }
      if (onHidden) {
        const index = hiddenCallbacks.indexOf(onHidden);
        if (index > -1) {
          hiddenCallbacks.splice(index, 1);
        }
      }
    };
  };

  return {
    isVisible,
    onVisibilityChange,
  };
}
