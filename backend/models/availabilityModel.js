import { pool } from '../config/db.js';

export const createSlot = async ({ user_id, start_time, end_time }) => {
  const [result] = await pool.query(
    'INSERT INTO availability_slot (user_id, start_time, end_time) VALUES (?, ?, ?)',
    [user_id, start_time, end_time]
  );
  return result.insertId;
};

export const getSlotsByUser = async (user_id) => {
  const [rows] = await pool.query('SELECT * FROM availability_slot WHERE user_id = ?', [user_id]);
  return rows;
};

export const updateSlot = async (slot_id, { start_time, end_time }) => {
  await pool.query(
    'UPDATE availability_slot SET start_time = ?, end_time = ? WHERE id = ?',
    [start_time, end_time, slot_id]
  );
};

export const deleteSlot = async (slot_id) => {
  await pool.query('DELETE FROM availability_slot WHERE id = ?', [slot_id]);
};
