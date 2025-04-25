import { getTasksByUser } from '../models/taskModel.js';
import { pool } from '../config/db.js';
import { getSlotsByUser } from '../models/availabilityModel.js';
import { getEnergyLevelsByUser } from '../models/energyModel.js';
import { createScheduleEntry, getScheduleByUser, clearScheduleByUser, updateScheduleEntry, markScheduleDone } from '../models/scheduleModel.js';
import { incrementUserScore } from '../models/scoreModel.js';
import { generateSchedule } from '../services/scheduleService.js';

export const generateUserSchedule = async (req, res, next) => {
  try {
    const user_id = req.user.id;
    const { date } = req.body;
    const tasks = await getTasksByUser(user_id);
    const slots = await getSlotsByUser(user_id);
    const energy = await getEnergyLevelsByUser(user_id);
    if (!tasks.length || !slots.length || !energy.length) {
      return res.status(400).json({ message: 'Tâches, créneaux et niveaux d\'énergie requis' });
    }
    await clearScheduleByUser(user_id);
    const planning = generateSchedule(tasks, slots, energy, date);
    for (const entry of planning) {
      await createScheduleEntry({ ...entry, user_id });
    }
    res.json(await getScheduleByUser(user_id));
  } catch (err) {
    next(err);
  }
};

export const getUserSchedule = async (req, res, next) => {
  try {
    const schedule = await getScheduleByUser(req.user.id);
    res.json(schedule);
  } catch (err) {
    next(err);
  }
};

// Marquer une tâche du planning comme terminée
export const markScheduleDoneCtrl = async (req, res, next) => {
  try {
    const { id } = req.params;
    // Marquer comme terminée
    await markScheduleDone(id);
    // Vérifier si la tâche est terminée à l'heure (avant ou à la fin prévue)
    const [rows] = await pool.query('SELECT end_datetime, done_at, user_id FROM generated_schedule WHERE id = ?', [id]);
    if (rows && rows.length > 0) {
      const { end_datetime, done_at, user_id } = rows[0];
      if (done_at && end_datetime && new Date(done_at) <= new Date(end_datetime)) {
        // Score +1
        await incrementUserScore(user_id, 1);
      }
    }
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

// Contrôleur pour mettre à jour une entrée du planning (drag-and-drop)
export const updateScheduleEntryCtrl = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { start_datetime, end_datetime, task_id } = req.body;
    await updateScheduleEntry(id, { start_datetime, end_datetime, task_id });
    res.json({ message: 'Entrée de planning mise à jour' });
  } catch (err) {
    next(err);
  }
};
