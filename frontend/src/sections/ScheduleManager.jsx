import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import Timeline from "react-calendar-timeline";
import { exportScheduleToPDF, exportScheduleToExcel } from "../utils/export";
import "react-calendar-timeline/lib/Timeline.css";

// Utilise une date complète (ex: '2025-04-24T09:00:00') pour créer un objet Date
const getDate = (dateTimeStr) => {
  return new Date(dateTimeStr);
};

const ScheduleManager = ({ score, onScoreChange }) => {
  const [schedule, setSchedule] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  // Pour éviter des alertes multiples pour la même tâche
  // Pour éviter des alertes multiples pour une même tâche et un même délai
  const [alertedTaskDelays, setAlertedTaskDelays] = useState([]); // [{taskId, delay}]

  // Demande la permission de notification au chargement
  useEffect(() => {
    if (window.Notification && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  // Notifications multiples (10, 5, 2, 0 min)
  useEffect(() => {
    const delays = [10, 5, 2, 0]; // minutes
    const interval = setInterval(() => {
      const now = new Date();
      schedule.forEach(s => {
        if (!s.start_datetime) return;
        const start = new Date(s.start_datetime);
        const diffMs = start - now;
        delays.forEach(delay => {
          const delayMs = delay * 60 * 1000;
          if (
            diffMs <= delayMs + 2000 && diffMs > delayMs &&
            !alertedTaskDelays.some(a => a.taskId === s.id && a.delay === delay)
          ) {
            const t = tasks.find(t => t.id === s.task_id);
            let msg = "";
            if (delay === 0) msg = `La tâche "${t ? t.name : 'Tâche'}" commence maintenant !`;
            else msg = `La tâche "${t ? t.name : 'Tâche'}" commence dans ${delay} minute${delay > 1 ? 's' : ''} !`;
            if (window.Notification && Notification.permission === "granted") {
              new Notification(msg);
            }
            // Jouer un son
            try {
              const audio = new Audio("/notify.mp3");
              audio.play();
            } catch (e) {}
            // Optionnel : alert() uniquement pour le 0 min
            if (delay === 0) alert(msg);
            setAlertedTaskDelays(prev => [...prev, { taskId: s.id, delay }]);
          }
        });
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [schedule, tasks, alertedTaskDelays]);

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
      if (typeof onScoreChange === 'function') {
        onScoreChange();
      }
    } catch (err) {
      setError("Erreur lors de la génération du planning");
    } finally {
      setLoading(false);
    }
  }

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
      done: s.done,
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
            itemRenderer={({ item, timelineContext, itemContext, getItemProps, getResizeProps }) => {
              const t = tasks.find(t => t.id === item.group);
              const category = t?.categorie || '-';
              const description = t?.description || '';
              const start = item.start_time;
              const end = item.end_time;
              const now = new Date();
              const isDone = item.done;
              const isCurrent = !isDone && now >= start && now <= end;
              const isFuture = !isDone && now < start;
              // Durée en minutes
              const durationMin = Math.round((end - start) / 60000);
              const hours = Math.floor(durationMin / 60);
              const minutes = durationMin % 60;
              const durationTxt = hours > 0 ? `${hours}h${minutes > 0 ? minutes : ''}` : `${minutes} min`;
              // Couleurs
              let bg = '#2563eb'; // bleu
              let color = '#fff';
              if (isDone) { bg = '#6b7280'; color = '#e5e7eb'; } // gris
              else if (isCurrent) { bg = '#22c55e'; color = '#fff'; } // vert
              else if (isFuture) { bg = '#f59e42'; color = '#fff'; } // orange
              // Tooltip
              const tooltip = `${item.title}\nCatégorie : ${category}\n${description ? 'Description : ' + description + '\n' : ''}Début : ${start.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}\nFin : ${end.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}\nDurée : ${durationTxt}`;
              return (
                <div
                  {...getItemProps({
                    style: {
                      background: bg,
                      color,
                      borderRadius: 8,
                      border: isCurrent ? '2px solid #16a34a' : 'none',
                      fontWeight: 600,
                      fontSize: 16,
                      boxShadow: isCurrent ? '0 2px 8px #16a34a33' : '0 1px 4px #0002',
                      opacity: isDone ? 0.7 : 1,
                      cursor: 'pointer',
                      padding: '0 8px',
                      display: 'flex',
                      alignItems: 'center',
                      height: '100%',
                    },
                    title: tooltip,
                  })}
                >
                  <div style={{width: '100%'}}>
                    <div style={{fontSize: 16, fontWeight: 700}}>{item.title}</div>
                    <div style={{fontSize: 13, opacity: 0.95}}>
                      {`${start.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${end.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} | ${durationTxt}`}
                    </div>
                    <div style={{fontSize: 12, opacity: 0.8}}>{category}</div>
                  </div>
                </div>
              );
            }}
          />
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Actions sur les tâches du planning</h3>
            <ul className="space-y-2">
              {schedule.map(s => {
                const t = tasks.find(t => t.id === s.task_id);
                return (
                  <li key={s.id} className="flex items-center gap-2">
                    <span className={s.done ? "line-through text-gray-400" : ""}>{t ? t.name : "Tâche"} ({new Date(s.start_datetime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(s.end_datetime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})})</span>
                    <button
                      className={`px-2 py-1 rounded text-xs ${s.done ? 'bg-gray-400' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                      disabled={!!s.done}
                      onClick={async () => {
                        try {
                          await axios.put(`/schedule/${s.id}/done`);
                          fetchSchedule();
                        if (typeof onScoreChange === 'function') {
                          onScoreChange();
                        }
                        } catch (e) {
                          alert("Erreur lors de la validation de la tâche");
                        }
                      }}
                    >
                      {s.done ? 'Terminée' : 'Terminer'}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </section>
  );
};

export default ScheduleManager;
