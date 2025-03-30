<template>
  <div>
    <Line :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Line } from "vue-chartjs";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  CategoryScale,
} from "chart.js";
import { generateRandomColor } from "../../common/colorUtils";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  CategoryScale
);

const props = defineProps<{
  dailyData: Array<{
    hour: string;
    activity: number;
  }>;
}>();

const chartData = computed(() => {
  const color = generateRandomColor();
  return {
    labels: props.dailyData.map((item) => item.hour),
    datasets: [
      {
        label: "Activity",
        data: props.dailyData.map((item) => item.activity),
        backgroundColor: color,
        borderColor: color,
        borderWidth: 2,
        tension: 0.4,
        fill: true,
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
        text: "Activity Level",
      },
    },
    x: {
      title: {
        display: true,
        text: "Hour of Day",
      },
    },
  },
};
</script>
