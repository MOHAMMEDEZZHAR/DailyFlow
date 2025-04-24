import { pool } from '../config/db.js';

export const createScheduleEntry = async ({ task_id, user_id, start_datetime, end_datetime }) => {
  const [result] = await pool.query(
    'INSERT INTO generated_schedule (task_id, user_id, start_datetime, end_datetime) VALUES (?, ?, ?, ?)',
    [task_id, user_id, start_datetime, end_datetime]
  );
  return result.insertId;
};

export const getScheduleByUser = async (user_id) => {
  const [rows] = await pool.query('SELECT * FROM generated_schedule WHERE user_id = ? ORDER BY start_datetime', [user_id]);
  return rows;
};

export const clearScheduleByUser = async (user_id) => {
  await pool.query('DELETE FROM generated_schedule WHERE user_id = ?', [user_id]);
};

export const updateScheduleEntry = async (id, { start_datetime, end_datetime, task_id }) => {
  await pool.query(
    'UPDATE generated_schedule SET start_datetime = ?, end_datetime = ?, task_id = ? WHERE id = ?',
    [start_datetime, end_datetime, task_id, id]
  );
};
