import { setEnergyLevel, getEnergyLevelsByUser } from '../models/energyModel.js';

export const setEnergy = async (req, res, next) => {
  try {
    const { period, level } = req.body;
    if (!period || typeof level !== 'number') {
      return res.status(400).json({ message: 'Période et niveau requis' });
    }
    await setEnergyLevel({ user_id: req.user.id, period, level });
    res.json({ message: 'Niveau d\'énergie enregistré' });
  } catch (err) {
    next(err);
  }
};

export const getEnergy = async (req, res, next) => {
  try {
    const levels = await getEnergyLevelsByUser(req.user.id);
    res.json(levels);
  } catch (err) {
    next(err);
  }
};
