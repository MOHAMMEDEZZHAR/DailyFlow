import React, { useEffect, useState } from "react";
import axios from "../api/axios";

const AvailabilityManager = () => {
  const [slots, setSlots] = useState([]);
  const [form, setForm] = useState({ start_time: "08:00:00", end_time: "12:00:00" });
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState(null);

  const fetchSlots = async () => {
    try {
      const res = await axios.get("/availability");
      setSlots(res.data);
    } catch {
      setSlots([]);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (editId) {
        await axios.put(`/availability/${editId}`, form);
      } else {
        await axios.post("/availability", form);
      }
      setForm({ start_time: "08:00:00", end_time: "12:00:00" });
      setEditId(null);
      fetchSlots();
    } catch (err) {
      setError(err.response?.data?.message || "Erreur serveur");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (slot) => {
    setForm({ start_time: slot.start_time, end_time: slot.end_time });
    setEditId(slot.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer ce créneau ?")) return;
    await axios.delete(`/availability/${id}`);
    fetchSlots();
  };

  return (
    <section>
      <h2 className="text-xl font-bold mb-2">Créneaux de disponibilité</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2 mb-4">
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <div className="flex gap-2">
          <input
            type="time"
            name="start_time"
            value={form.start_time}
            onChange={handleChange}
            className="px-2 py-1 rounded border dark:bg-gray-900"
            required
          />
          <input
            type="time"
            name="end_time"
            value={form.end_time}
            onChange={handleChange}
            className="px-2 py-1 rounded border dark:bg-gray-900"
            required
          />
          <button
            type="submit"
            className="px-4 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
            disabled={loading}
          >
            {editId ? "Modifier" : "Ajouter"}
          </button>
        </div>
      </form>
      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
        {slots.map((slot) => (
          <li key={slot.id} className="flex items-center justify-between py-2">
            <span>
              {slot.start_time} — {slot.end_time}
            </span>
            <span className="flex gap-2">
              <button className="text-blue-600" onClick={() => handleEdit(slot)}>
                Modifier
              </button>
              <button className="text-red-500" onClick={() => handleDelete(slot.id)}>
                Supprimer
              </button>
            </span>
          </li>
        ))}
        {slots.length === 0 && <li className="text-gray-500">Aucun créneau</li>}
      </ul>
    </section>
  );
};

export default AvailabilityManager;
