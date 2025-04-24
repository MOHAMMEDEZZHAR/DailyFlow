import { pool } from '../config/db.js';

export const setEnergyLevel = async ({ user_id, period, level }) => {
  // Upsert (insert or update)
  await pool.query(
    'INSERT INTO energy_level (user_id, period, level) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE level = ?',
    [user_id, period, level, level]
  );
};

export const getEnergyLevelsByUser = async (user_id) => {
  const [rows] = await pool.query('SELECT * FROM energy_level WHERE user_id = ?', [user_id]);
  return rows;
};
