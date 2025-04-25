import { pool } from '../config/db.js';

export const incrementUserScore = async (user_id, points = 1) => {
  await pool.query('UPDATE utilisateur SET score = score + ? WHERE id = ?', [points, user_id]);
};

export const getUserScore = async (user_id) => {
  const [rows] = await pool.query('SELECT score FROM utilisateur WHERE id = ?', [user_id]);
  return rows.length ? rows[0].score : 0;
};
