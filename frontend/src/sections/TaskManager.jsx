import React, { useEffect, useState } from "react";
import axios from "../api/axios";

const priorities = [1, 2, 3, 4, 5];

const categories = ["Travail", "Perso", "Urgent", "Autre"];

const TaskManager = () => {
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState({ name: "", duration: 1, priority: 3, description: "", categorie: categories[0] }); // durée en heures côté UI
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState(null);

  const fetchTasks = async () => {
    try {
      const res = await axios.get("/tasks");
      setTasks(res.data);
    } catch {
      setTasks([]);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: name === "duration" ? Number(value) : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Toujours envoyer la durée en minutes au backend
      const payload = { ...form, duration: Number(form.duration) * 60 };
      if (editId) {
        await axios.put(`/tasks/${editId}`, payload);
      } else {
        await axios.post("/tasks", payload);
      }
      // Générer automatiquement le planning après ajout/modification de tâche
      try {
        await axios.post("/schedule/generate");
      } catch (e) {
        // Optionnel : afficher une alerte ou ignorer
      }
      setForm({ name: "", duration: 1, priority: 3, description: "", categorie: categories[0] });
      setEditId(null);
      fetchTasks();
    } catch (err) {
      setError(err.response?.data?.message || "Erreur serveur");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (task) => {
    setForm({
      name: task.name,
      duration: task.duration / 60, // on repasse en heures côté UI
      priority: task.priority,
      description: task.description || "",
      categorie: task.categorie || categories[0],
    });
    setEditId(task.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cette tâche ?")) return;
    await axios.delete(`/tasks/${id}`);
    fetchTasks();
  };

  return (
    <section>
      <h2 className="text-xl font-bold mb-2">Tâches à faire</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2 mb-4">
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <div className="flex gap-2 items-end">
          <input
            type="text"
            name="name"
            placeholder="Nom de la tâche"
            value={form.name}
            onChange={handleChange}
            className="flex-1 px-2 py-1 rounded border dark:bg-gray-900"
            required
          />
          <input
            type="number"
            name="duration"
            placeholder="Durée (heures)"
            min={0.25}
            step={0.25}
            value={form.duration}
            onChange={handleChange}
            className="w-28 px-2 py-1 rounded border dark:bg-gray-900"
            required
          />
          <select
            name="priority"
            value={form.priority}
            onChange={handleChange}
            className="w-28 px-2 py-1 rounded border dark:bg-gray-900"
          >
            {priorities.map((p) => (
              <option key={p} value={p}>
                Priorité {p}
              </option>
            ))}
          </select>
          <select
            name="categorie"
            value={form.categorie}
            onChange={handleChange}
            className="w-32 px-2 py-1 rounded border dark:bg-gray-900"
            required
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="px-4 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
          disabled={loading}
        >
          {editId ? "Modifier" : "Ajouter"}
        </button>
        <textarea
          name="description"
          placeholder="Description de la tâche"
          value={form.description}
          onChange={handleChange}
          className="px-2 py-1 rounded border dark:bg-gray-900 resize-none"
          rows={2}
        />
      </form>
      {/* Si tu veux afficher la date du planning ici, fais-le en dehors du bouton : */}
      {/* <div className="mt-2 text-right text-sm text-gray-600">Date du planning : {selectedDate}</div> */}
      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
        {tasks.map((task) => (
          <li key={task.id} className="flex items-start justify-between py-2">
            <div className="flex-1">
              <span className="font-semibold">{task.name}</span> — {(task.duration / 60).toLocaleString(undefined, { maximumFractionDigits: 2 })} h — Priorité {task.priority}<br />
              <span className="text-xs text-gray-500">Catégorie : {task.categorie || "-"}</span><br />
              {task.description && <span className="block text-sm text-gray-700 dark:text-gray-300">{task.description}</span>}
            </div>
            <span className="flex gap-2 mt-1">
              <button className="text-blue-600" onClick={() => handleEdit(task)}>
                Modifier
              </button>
              <button className="text-red-500" onClick={() => handleDelete(task.id)}>
                Supprimer
              </button>
            </span>
          </li>
        ))}
        {tasks.length === 0 && <li className="text-gray-500">Aucune tâche</li>}
      </ul>
    </section>
  );
};

export default TaskManager;
