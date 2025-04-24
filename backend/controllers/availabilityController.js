import { createSlot, getSlotsByUser, updateSlot, deleteSlot } from '../models/availabilityModel.js';

export const addSlot = async (req, res, next) => {
  try {
    const { start_time, end_time } = req.body;
    if (!start_time || !end_time) {
      return res.status(400).json({ message: 'Heures de début et fin requises' });
    }
    const slotId = await createSlot({ user_id: req.user.id, start_time, end_time });
    res.status(201).json({ id: slotId });
  } catch (err) {
    next(err);
  }
};

export const getSlots = async (req, res, next) => {
  try {
    const slots = await getSlotsByUser(req.user.id);
    res.json(slots);
  } catch (err) {
    next(err);
  }
};

export const updateSlotCtrl = async (req, res, next) => {
  try {
    const { slotId } = req.params;
    const { start_time, end_time } = req.body;
    await updateSlot(slotId, { start_time, end_time });
    res.json({ message: 'Créneau modifié' });
  } catch (err) {
    next(err);
  }
};

export const deleteSlotCtrl = async (req, res, next) => {
  try {
    const { slotId } = req.params;
    await deleteSlot(slotId);
    res.json({ message: 'Créneau supprimé' });
  } catch (err) {
    next(err);
  }
};
