// Algorithme simple :
// - Trie les tâches par priorité DESC, durée DESC
// - Place les tâches longues/prioritaires dans les créneaux où l'énergie est la plus haute
// - Respecte les pauses de 10min entre tâches

function parseTimeToMinutes(timeStr) {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTimeString(minutes) {
  const h = String(Math.floor(minutes / 60)).padStart(2, '0');
  const m = String(minutes % 60).padStart(2, '0');
  return `${h}:${m}:00`;
}

function getPeriodFromTime(min) {
  if (min < 12 * 60) return 'morning';
  if (min < 18 * 60) return 'afternoon';
  return 'evening';
}

export function generateSchedule(tasks, slots, energyLevels, selectedDate) {
  const planning = [];
  // Trie par priorité puis durée
  const sortedTasks = [...tasks].sort((a, b) => {
    if (b.priority !== a.priority) return b.priority - a.priority;
    return b.duration - a.duration;
  });
  // Trie les créneaux par heure de début
  const sortedSlots = [...slots].sort((a, b) => parseTimeToMinutes(a.start_time) - parseTimeToMinutes(b.start_time));
  // Map énergie par période
  const energyMap = {};
  for (const e of energyLevels) energyMap[e.period] = e.level;

  let taskIdx = 0;
  for (const slot of sortedSlots) {
    let current = parseTimeToMinutes(slot.start_time);
    const end = parseTimeToMinutes(slot.end_time);
    while (taskIdx < sortedTasks.length && current < end) {
      const task = sortedTasks[taskIdx];
      const period = getPeriodFromTime(current);
      // Si énergie < 30, on saute ce créneau
      if ((energyMap[period] || 0) < 30) {
        current += 60; // saute 1h
        continue;
      }
      if (current + task.duration > end) break;
      // Utilise la date sélectionnée pour chaque tâche générée
      const planningDate = selectedDate || new Date().toISOString().slice(0, 10); // YYYY-MM-DD
      planning.push({
        task_id: task.id,
        start_datetime: `${planningDate} ${minutesToTimeString(current)}`,
        end_datetime: `${planningDate} ${minutesToTimeString(current + task.duration)}`,
      });
      current += task.duration + 10; // pause 10min
      taskIdx++;
    }
  }
  return planning;
}
