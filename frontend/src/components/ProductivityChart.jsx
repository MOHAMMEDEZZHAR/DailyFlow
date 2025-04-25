import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ProductivityChart = ({ data }) => {
  // data = [{ date: '2025-04-25', completed: 3 }, ...]
  const chartData = {
    labels: data.map((d) => {
      const dateObj = new Date(d.date);
      return dateObj.toLocaleDateString('fr-FR');
    }),
    datasets: [
      {
        label: "Tâches terminées",
        data: data.map((d) => d.completed),
        backgroundColor: (ctx) => {
          const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 400);
          gradient.addColorStop(0, '#10b981'); // vert moderne
          gradient.addColorStop(1, '#22d3ee'); // bleu clair
          return gradient;
        },
        borderRadius: 12,
        barPercentage: 0.5,
        categoryPercentage: 0.6,
      },
    ],
  };
  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top", labels: { font: { size: 16 } } },
      title: { display: true, text: "Productivité quotidienne", font: { size: 20 } },
      tooltip: {
        callbacks: {
          title: (ctx) => `Date : ${ctx[0].label}`,
          label: (ctx) => `Tâches terminées : ${ctx.parsed.y}`,
        },
        backgroundColor: '#222',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#10b981',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
      },
      datalabels: {
        display: true,
        color: '#222',
        font: { weight: 'bold', size: 16 },
        anchor: 'end',
        align: 'start',
        formatter: (value) => value,
      },
    },
    scales: {
      x: {
        ticks: { font: { size: 14 }, color: '#222' },
        grid: { display: false },
      },
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1, font: { size: 14 }, color: '#222' },
        grid: { color: '#e5e7eb' },
        max: Math.max(...data.map(d => d.completed), 1),
      },
    },
  };
  // Ajout du plugin datalabels si disponible
  let BarComponent = Bar;
  try {
    // eslint-disable-next-line
    const ChartDataLabels = require('chartjs-plugin-datalabels');
    BarComponent = (props) => <Bar {...props} plugins={[ChartDataLabels]} />;
  } catch {}
  return <BarComponent data={chartData} options={options} />;
};

export default ProductivityChart;
