import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import Timeline from "react-calendar-timeline";
import { exportScheduleToPDF, exportScheduleToExcel } from "../utils/export";
import "react-calendar-timeline/lib/Timeline.css";

// Utilise une date complète (ex: '2025-04-24T09:00:00') pour créer un objet Date
const getDate = (dateTimeStr) => {
  return new Date(dateTimeStr);
};

const ScheduleManager = () => {
  const [schedule, setSchedule] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));

  const fetchSchedule = async () => {
    setLoading(true);
    setError(null);
    try {
      const [schedRes, taskRes] = await Promise.all([
        axios.get("/schedule"),
        axios.get("/tasks"),
      ]);
      setSchedule(schedRes.data);
      setTasks(taskRes.data);
    } catch (err) {
      setError("Erreur lors du chargement du planning");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, []);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      await axios.post("/schedule/generate", { date: selectedDate });
      fetchSchedule();
    } catch (err) {
      setError("Erreur lors de la génération du planning");
    } finally {
      setLoading(false);
    }
  };

  // Pour react-calendar-timeline
  const groups = tasks.length > 0 ? tasks.map((t) => ({ id: t.id, title: t.name })) : [{ id: 1, title: "Aucun" }];
  const items = schedule
    .filter(s => s.start_datetime && s.end_datetime && tasks.find(t => t.id === s.task_id))
    .map((s) => ({
      id: s.id,
      group: s.task_id,
      title: tasks.find((t) => t.id === s.task_id)?.name || "Tâche",
      start_time: s.start_datetime ? new Date(s.start_datetime) : new Date(),
      end_time: s.end_datetime ? new Date(s.end_datetime) : new Date(),
    }));

  return (
    <section>
      <h2 className="text-xl font-bold mb-2">Planning optimisé</h2>
      <div className="mb-2">
        <label className="mr-2 font-medium">Date du planning :</label>
        <input
          type="date"
          value={selectedDate}
          onChange={e => setSelectedDate(e.target.value)}
          className="border rounded px-2 py-1"
          disabled={loading}
        />
      </div>
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded mb-2"
        onClick={handleGenerate}
        disabled={loading}
      >
        Générer le planning
      </button>
      <div className="flex gap-2 mb-2">
        <button
          className="bg-green-600 text-white px-4 py-2 rounded"
          onClick={() => {
            try {
              exportScheduleToPDF(schedule, tasks);
            } catch (e) {
              alert("Erreur lors de l'export PDF : " + (e?.message || e));
            }
          }}
          disabled={loading || schedule.length === 0}
        >
          Exporter PDF
        </button>
        <button
          className="bg-yellow-500 text-white px-4 py-2 rounded"
          onClick={() => exportScheduleToExcel(schedule, tasks)}
          disabled={loading || schedule.length === 0}
        >
          Exporter Excel
        </button>
      </div>

      {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
      {loading ? (
        <div>Chargement...</div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded shadow p-2">
           <Timeline
            groups={groups}
            items={items}
            defaultTimeStart={items.length > 0 ? items[0].start_time : new Date()}
            defaultTimeEnd={items.length > 0 ? items[0].end_time : new Date(Date.now() + 2 * 60 * 60 * 1000)}
            canMove={true}
            canResize={false}
            onItemMove={async (itemId, dragTime, newGroupOrder) => {
              const item = items.find(i => i.id === itemId);
              if (!item) return;
              const newStart = new Date(dragTime);
              const duration = item.end_time - item.start_time;
              const newEnd = new Date(newStart.getTime() + duration);
              try {
                await axios.put(`/schedule/${itemId}`, {
                  start_datetime: newStart.toISOString(),
                  end_datetime: newEnd.toISOString(),
                  task_id: groups[newGroupOrder].id
                });
                fetchSchedule();
              } catch (err) {
                alert("Erreur lors du déplacement de la tâche");
              }
            }}
            stackItems
            itemHeightRatio={0.75}
            lineHeight={50}
            minZoom={60 * 60 * 1000}
            maxZoom={24 * 60 * 60 * 1000}
            sidebarWidth={120}
          />
        </div>
      )}
    </section>
  );
};

export default ScheduleManager;
