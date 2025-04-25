import React, { useEffect, useState } from "react";
import "./chartjs-init";
import axios from "../api/axios";
import { fetchCompletedTasksPerDay } from "../api/report";
import { Bar, Pie } from "react-chartjs-2";

function groupBy(array, key) {
  return array.reduce((result, item) => {
    (result[item[key]] = result[item[key]] || []).push(item);
    return result;
  }, {});
}

const AdvancedStats = () => {
  const [tasks, setTasks] = useState([]);
  const [completedStats, setCompletedStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      axios.get("/tasks"),
      fetchCompletedTasksPerDay()
    ])
      .then(([tasksRes, completedStats]) => {
        setTasks(tasksRes.data);
        setCompletedStats(completedStats);
      })
      .catch(e => setError(e?.message || "Erreur stats"))
      .finally(() => setLoading(false));
  }, []);

  // Stat 1 : tâches terminées par jour de la semaine
  const completedByDay = Array(7).fill(0);
  completedStats.forEach(stat => {
    const date = new Date(stat.date);
    completedByDay[date.getDay()] += stat.completed;
  });
  const days = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

  // Stat 2 : répartition par catégorie
  const catCounts = {};
  tasks.forEach(t => {
    catCounts[t.categorie] = (catCounts[t.categorie] || 0) + 1;
  });

  // Stat 3 : répartition par priorité
  const prioCounts = {};
  tasks.forEach(t => {
    prioCounts[t.priority] = (prioCounts[t.priority] || 0) + 1;
  });

  if (loading) return <div>Chargement des statistiques…</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="bg-white dark:bg-gray-800 rounded shadow p-4 mt-4">
      <h2 className="text-xl font-bold mb-4">Statistiques avancées</h2>
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h3 className="font-semibold mb-2">Tâches terminées par jour</h3>
          <Bar
            data={{
              labels: days,
              datasets: [{
                label: "Tâches terminées",
                data: completedByDay,
                backgroundColor: "#2563eb"
              }]
            }}
            options={{
              plugins: { legend: { display: false } },
              scales: { y: { beginAtZero: true } }
            }}
          />
        </div>
        <div>
          <h3 className="font-semibold mb-2">Répartition par catégorie</h3>
          <Pie
            data={{
              labels: Object.keys(catCounts),
              datasets: [{
                data: Object.values(catCounts),
                backgroundColor: ["#f59e42", "#10b981", "#3b82f6", "#f43f5e", "#a78bfa"]
              }]
            }}
          />
        </div>
        <div>
          <h3 className="font-semibold mb-2">Répartition par priorité</h3>
          <Pie
            data={{
              labels: Object.keys(prioCounts).map(p => `Priorité ${p}`),
              datasets: [{
                data: Object.values(prioCounts),
                backgroundColor: ["#f43f5e", "#f59e42", "#10b981", "#3b82f6", "#a78bfa"]
              }]
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default AdvancedStats;
