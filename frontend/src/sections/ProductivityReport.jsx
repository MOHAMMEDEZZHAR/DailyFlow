import React, { useEffect, useState } from "react";
import { fetchCompletedTasksPerDay } from "../api/report";
import ProductivityChart from "../components/ProductivityChart";

const ProductivityReport = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const refresh = () => {
      setLoading(true);
      fetchCompletedTasksPerDay()
        .then(d => { if (mounted) setData(d); })
        .catch(() => { if (mounted) setError("Erreur lors du chargement du rapport"); })
        .finally(() => { if (mounted) setLoading(false); });
    };
    refresh();
    const interval = setInterval(refresh, 10000); // refresh toutes les 10s
    return () => { mounted = false; clearInterval(interval); };
  }, []);

  if (loading) return <div>Chargement du rapport...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!data.length) return <div>Aucune tâche terminée récemment.</div>;

  // On affiche les dates dans l'ordre chronologique
  const sortedData = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div className="bg-white dark:bg-gray-800 rounded shadow p-4 mt-4">
      <h2 className="text-xl font-bold mb-2">Rapport de productivité</h2>
      <ProductivityChart data={sortedData} />
    </div>
  );
};

export default ProductivityReport;
