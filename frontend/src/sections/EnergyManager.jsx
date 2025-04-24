import React, { useEffect, useState } from "react";
import axios from "../api/axios";

const periods = [
  { key: "morning", label: "Matin" },
  { key: "afternoon", label: "Après-midi" },
  { key: "evening", label: "Soir" },
];

const EnergyManager = () => {
  const [levels, setLevels] = useState({ morning: 50, afternoon: 50, evening: 50 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchLevels = async () => {
    try {
      const res = await axios.get("/energy");
      const obj = { morning: 50, afternoon: 50, evening: 50 };
      res.data.forEach((e) => { obj[e.period] = e.level; });
      setLevels(obj);
    } catch {
      setLevels({ morning: 50, afternoon: 50, evening: 50 });
    }
  };

  useEffect(() => {
    fetchLevels();
  }, []);

  const handleChange = (period, value) => {
    setLevels({ ...levels, [period]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      for (const period of periods) {
        await axios.post("/energy", { period: period.key, level: Number(levels[period.key]) });
      }
      fetchLevels();
    } catch (err) {
      setError(err.response?.data?.message || "Erreur serveur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <h2 className="text-xl font-bold mb-2">Niveaux d'énergie</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2 mb-4">
        {error && <div className="text-red-500 text-sm">{error}</div>}
        {periods.map((p) => (
          <div key={p.key} className="flex items-center gap-2">
            <label className="w-28">{p.label}</label>
            <input
              type="range"
              min={0}
              max={100}
              value={levels[p.key]}
              onChange={(e) => handleChange(p.key, e.target.value)}
              className="flex-1 accent-blue-600"
            />
            <span className="w-10 text-right">{levels[p.key]}</span>
          </div>
        ))}
        <button
          type="submit"
          className="mt-2 px-4 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? "Enregistrement..." : "Enregistrer"}
        </button>
      </form>
    </section>
  );
};

export default EnergyManager;
