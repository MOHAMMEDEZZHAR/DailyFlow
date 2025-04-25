import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import { fetchCompletedTasksPerDay } from "../api/report";

// Génère des suggestions avancées à partir des stats, de l'énergie et des tâches non terminées
function generateSuggestions({ completedStats, tasks, energy }) {
  const suggestions = [];

  // 1. Productivité par jour de la semaine
  const completedByDay = Array(7).fill(0);
  completedStats.forEach(stat => {
    const date = new Date(stat.date);
    completedByDay[date.getDay()] += stat.completed;
  });
  const maxDay = completedByDay.indexOf(Math.max(...completedByDay));
  const minDay = completedByDay.indexOf(Math.min(...completedByDay));
  const days = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
  if (completedByDay[maxDay] > 0) {
    suggestions.push(
      `Vous êtes le plus productif le ${days[maxDay]}. Essayez de planifier vos tâches importantes ce jour-là !`
    );
  }
  if (completedByDay[minDay] < completedByDay[maxDay]) {
    suggestions.push(
      `Votre productivité est plus basse le ${days[minDay]}. Pensez à alléger cette journée ou à y placer des tâches plus simples.`
    );
  }

  // 2. Répartition des priorités
  const prioCounts = {};
  tasks.forEach(t => {
    prioCounts[t.priority] = (prioCounts[t.priority] || 0) + 1;
  });
  const maxPrio = Object.keys(prioCounts).reduce((a, b) => prioCounts[a] > prioCounts[b] ? a : b, null);
  if (maxPrio) {
    suggestions.push(`Vous planifiez surtout des tâches de priorité ${maxPrio}. Pensez à équilibrer avec des tâches moins urgentes.`);
  }

  // 3. Répartition des catégories
  const catCounts = {};
  tasks.forEach(t => {
    catCounts[t.categorie] = (catCounts[t.categorie] || 0) + 1;
  });
  const maxCat = Object.keys(catCounts).reduce((a, b) => catCounts[a] > catCounts[b] ? a : b, null);
  if (maxCat) {
    suggestions.push(`Vous avez beaucoup de tâches dans la catégorie "${maxCat}". Pensez à varier pour éviter la routine !`);
  }

  // 4. Analyse de l'énergie
  if (energy) {
    const maxPeriod = Object.keys(energy).reduce((a, b) => energy[a] > energy[b] ? a : b, "morning");
    const minPeriod = Object.keys(energy).reduce((a, b) => energy[a] < energy[b] ? a : b, "morning");
    const periodLabels = { morning: "matin", afternoon: "après-midi", evening: "soir" };
    if (energy[maxPeriod] - energy[minPeriod] > 20) {
      suggestions.push(`Votre niveau d'énergie est plus élevé le ${periodLabels[maxPeriod]}. Planifiez vos tâches complexes à ce moment.`);
      suggestions.push(`Votre énergie est plus basse le ${periodLabels[minPeriod]}. Privilégiez les tâches simples ou des pauses.`);
    }
  }

  // 5. Suggestions sur les tâches non terminées
  const nonDone = tasks.filter(t => !t.completed && !t.done);
  if (nonDone.length > 0) {
    const overdue = nonDone.filter(t => t.due_date && new Date(t.due_date) < new Date());
    if (overdue.length > 0) {
      suggestions.push(`Vous avez ${overdue.length} tâche(s) en retard. Essayez de les replanifier ou de les terminer rapidement !`);
    }
    if (nonDone.length > 5) {
      suggestions.push(`Vous avez beaucoup de tâches non terminées (${nonDone.length}). Pensez à prioriser ou à déléguer certaines tâches.`);
    }
  }

  if (suggestions.length === 0) suggestions.push("Aucune suggestion particulière pour l'instant. Continuez comme ça !");
  return suggestions;
}

const SmartSuggestions = () => {
  const [tasks, setTasks] = useState([]);
  const [completedStats, setCompletedStats] = useState([]);
  const [energy, setEnergy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const refresh = () => {
      setLoading(true);
      Promise.all([
        axios.get("/tasks"),
        fetchCompletedTasksPerDay(),
        axios.get("/energy")
      ])
        .then(([tasksRes, completedStats, energyRes]) => {
          if (!mounted) return;
          setTasks(tasksRes.data);
          setCompletedStats(completedStats);
          // energyRes.data: tableau [{period, level}]
          const energy = { morning: 50, afternoon: 50, evening: 50 };
          (energyRes.data || []).forEach(e => { energy[e.period] = e.level; });
          setEnergy(energy);
          setSuggestions(generateSuggestions({ completedStats, tasks: tasksRes.data, energy }));
        })
        .catch(e => { if (mounted) setError(e?.message || "Erreur suggestions"); })
        .finally(() => { if (mounted) setLoading(false); });
    };
    refresh();
    const interval = setInterval(refresh, 10000); // refresh toutes les 10s
    window.addEventListener('focus', refresh);
    return () => { mounted = false; clearInterval(interval); window.removeEventListener('focus', refresh); };
  }, []);

  if (loading) return <div>Chargement des suggestions…</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="bg-white dark:bg-gray-800 rounded shadow p-4 mt-4">
      <h2 className="text-xl font-bold mb-4">Suggestions intelligentes</h2>
      <ul className="list-disc ml-5 space-y-2">
        {suggestions.map((s, i) => <li key={i}>{s}</li>)}
      </ul>
    </div>
  );
};

export default SmartSuggestions;
