import { getTasksByUser } from '../models/taskModel.js';
import { getSlotsByUser } from '../models/availabilityModel.js';
import { getEnergyLevelsByUser } from '../models/energyModel.js';
import { createScheduleEntry, getScheduleByUser, clearScheduleByUser, updateScheduleEntry } from '../models/scheduleModel.js';
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
