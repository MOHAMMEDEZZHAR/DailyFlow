import { createTask, getTasksByUser, updateTask, deleteTask, getTaskById } from '../models/taskModel.js';

export const addTask = async (req, res, next) => {
  try {
    const { name, duration, priority } = req.body;
    if (!name || !duration) {
      return res.status(400).json({ message: 'Nom et durée requis' });
    }
    const taskId = await createTask({ name, duration, priority, user_id: req.user.id });
    res.status(201).json({ id: taskId });
  } catch (err) {
    next(err);
  }
};

export const getTasks = async (req, res, next) => {
  try {
    const tasks = await getTasksByUser(req.user.id);
    res.json(tasks);
  } catch (err) {
    next(err);
  }
};

export const updateTaskCtrl = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const { name, duration, priority } = req.body;
    const task = await getTaskById(taskId);
    if (!task || task.user_id !== req.user.id) {
      return res.status(404).json({ message: 'Tâche non trouvée' });
    }
    await updateTask(taskId, { name, duration, priority });
    res.json({ message: 'Tâche mise à jour' });
  } catch (err) {
    next(err);
  }
};

export const deleteTaskCtrl = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const task = await getTaskById(taskId);
    if (!task || task.user_id !== req.user.id) {
      return res.status(404).json({ message: 'Tâche non trouvée' });
    }
    await deleteTask(taskId);
    res.json({ message: 'Tâche supprimée' });
  } catch (err) {
    next(err);
  }
};
