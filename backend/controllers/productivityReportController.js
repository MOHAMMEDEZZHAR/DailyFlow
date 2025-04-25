import { pool } from '../config/db.js';

// Renvoie le nombre de tâches terminées par jour pour l'utilisateur connecté
export const getCompletedTasksPerDay = async (req, res, next) => {
  try {
    const user_id = req.user.id;
    const [rows] = await pool.query(
      `SELECT DATE(done_at) as date, COUNT(*) as completed
       FROM generated_schedule
       WHERE user_id = ? AND done = 1 AND done_at IS NOT NULL
       GROUP BY DATE(done_at)
       ORDER BY date DESC
       LIMIT 7`,
      [user_id]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
};
