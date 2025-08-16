'use client'
import { Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js"

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend)

const data = {
  labels: [
    "Semaine 1",
    "Semaine 2",
    "Semaine 3",
    "Semaine 4",
    "Semaine 5",
  ],
  datasets: [
    {
      label: "Réservations",
      data: [80, 120, 100, 150, 130],
      fill: false,
      borderColor: "#2563eb",
      backgroundColor: "#2563eb",
      tension: 0.4,
      pointRadius: 5,
      pointBackgroundColor: "#2563eb",
    },
  ],
}

const options = {
  responsive: true,
  plugins: {
    legend: {
      display: true,
      position: "top" as const,
      labels: {
        color: "#1e293b",
        font: { size: 14, weight: 'bold' as const },
      },
    },
  },
  scales: {
    x: {
      ticks: { color: "#64748b" },
      grid: { color: "#e5e7eb" },
    },
    y: {
      beginAtZero: true,
      ticks: { color: "#64748b" },
      grid: { color: "#e5e7eb" },
    },
  },
}

export default function ReservationsChart() {
  return (
    <div className="bg-white rounded-xl shadow p-6 mt-8 w-full">
      <h2 className="text-lg font-semibold mb-4 text-gray-800">Réservations par semaine</h2>
      <div className="w-full" >
        <Line data={data} options={options} height={60} />
      </div>
    </div>
  )
}