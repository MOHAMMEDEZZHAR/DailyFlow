import { pool } from '../config/db.js';

export const createTask = async ({ name, duration, priority, user_id, description = null, categorie = null }) => {
  const [result] = await pool.query(
    'INSERT INTO task (name, duration, priority, user_id, description, categorie) VALUES (?, ?, ?, ?, ?, ?)',
    [name, duration, priority, user_id, description, categorie]
  );
  return result.insertId;
};

export const getTasksByUser = async (user_id) => {
  const [rows] = await pool.query('SELECT * FROM task WHERE user_id = ?', [user_id]);
  return rows;
};

export const updateTask = async (task_id, { name, duration, priority, description = null, categorie = null }) => {
  await pool.query(
    'UPDATE task SET name = ?, duration = ?, priority = ?, description = ?, categorie = ? WHERE id = ?',
    [name, duration, priority, description, categorie, task_id]
  );
};

export const deleteTask = async (task_id) => {
  await pool.query('DELETE FROM task WHERE id = ?', [task_id]);
};

export const getTaskById = async (task_id) => {
  const [rows] = await pool.query('SELECT * FROM task WHERE id = ?', [task_id]);
  return rows[0];
};
