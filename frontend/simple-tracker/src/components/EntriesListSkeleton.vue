<template>
  <div v-for="day in 2" :key="day" class="animate-pulse">
    <!-- Date header skeleton -->
    <div class="pt-4 px-4 font-bold uppercase flex flex-row justify-between">
      <div class="h-6 w-32 grainy rounded dark:bg-blend-overlay"></div>
      <div class="h-6 w-20 grainy rounded dark:bg-blend-overlay"></div>
    </div>

    <!-- Entries skeleton -->
    <div class="mt-2">
      <div v-for="entry in 3" :key="entry" class="px-4 my-4">
        <div class="h-18 w-full rounded-md grainy dark:bg-blend-overlay"></div>
      </div>
    </div>
  </div>
</template>
