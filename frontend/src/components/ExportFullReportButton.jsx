import React, { useState } from "react";
import axios from "../api/axios";
import { fetchCompletedTasksPerDay } from "../api/report";
import { exportFullReport, exportFullReportExcel } from "../utils/export";

const ExportFullReportButton = ({ score }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleExport = async (type = "pdf") => {
    setLoading(true);
    setError(null);
    try {
      // Récupérer toutes les données nécessaires
      const [tasksRes, availRes, energyRes, scheduleRes, prodStats] = await Promise.all([
        axios.get("/tasks"),
        axios.get("/availability"),
        axios.get("/energy"),
        axios.get("/schedule"),
        fetchCompletedTasksPerDay()
      ]);
      const allTasks = tasksRes.data;
      const availabilities = availRes.data;
      // Energy levels sous forme { morning: X, afternoon: X, evening: X }
      const energyLevels = { morning: 50, afternoon: 50, evening: 50 };
      energyRes.data.forEach(e => { energyLevels[e.period] = e.level; });
      const schedule = scheduleRes.data;
      // Pour le planning, on a besoin de la liste des tâches planifiées
      // (tasks déjà récupérées)
      const productivityStats = prodStats;
      const exportArgs = {
        schedule,
        tasks: allTasks,
        availabilities,
        energyLevels,
        productivityStats,
        allTasks,
        scoreProductivite: score
      };
      if (type === "pdf") {
        await exportFullReport(exportArgs);
      } else {
        await exportFullReportExcel(exportArgs);
      }
    } catch (e) {
      setError(e?.message || "Erreur lors de l'export");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 my-4">
      <button
        className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded shadow disabled:opacity-60"
        disabled={loading}
        onClick={() => handleExport("pdf")}
      >
        {loading ? "Export en cours..." : "Exporter rapport complet (PDF)"}
      </button>
      <button
        className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded shadow disabled:opacity-60"
        disabled={loading}
        onClick={() => handleExport("excel")}
      >
        {loading ? "Export en cours..." : "Exporter rapport complet (Excel)"}
      </button>
      {error && <div className="text-red-500 mt-2">{error}</div>}
    </div>
  );
};

export default ExportFullReportButton;
