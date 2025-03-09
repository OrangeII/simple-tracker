import { ref, onMounted, onUnmounted } from "vue";

export function useBreakpoints() {
  const isDesktop = ref(false);
  const isMobile = ref(true);

  const checkWidth = () => {
    isDesktop.value = window.innerWidth >= 1024; // lg breakpoint
    isMobile.value = !isDesktop.value;
  };

  onMounted(() => {
    checkWidth();
    window.addEventListener("resize", checkWidth);
  });

  onUnmounted(() => {
    window.removeEventListener("resize", checkWidth);
  });

  return {
    isDesktop,
    isMobile,
  };
}
