import { incrementUserScore, getUserScore } from '../models/scoreModel.js';

export const addScore = async (req, res, next) => {
  try {
    const user_id = req.user.id;
    const { points } = req.body;
    await incrementUserScore(user_id, points || 1);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

export const fetchScore = async (req, res, next) => {
  try {
    const user_id = req.user.id;
    const score = await getUserScore(user_id);
    res.json({ score });
  } catch (err) {
    next(err);
  }
};
