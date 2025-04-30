<template>
  <div>
    <Bar :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Bar } from "vue-chartjs";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";
import { useStyleStore } from "../../stores/style";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
);

const styleStore = useStyleStore();

const props = defineProps<{
  weeklyData: Array<{
    day: string;
    hours: number;
  }>;
}>();

const chartData = computed(() => {
  return {
    labels: props.weeklyData.map((item) => item.day),
    datasets: [
      {
        label: "Hours",
        data: props.weeklyData.map((item) => item.hours),
        backgroundColor: styleStore.getPrimaryColor(),
        borderRadius: 2,
      },
    ],
  };
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: "Hours",
      },
    },
  },
};
</script>
