import { pool } from '../config/db.js';

export const findUserByEmail = async (email) => {
  const [rows] = await pool.query('SELECT * FROM utilisateur WHERE email = ?', [email]);
  return rows[0];
};

export const createUser = async ({ email, password, nom, prenom }) => {
  const [result] = await pool.query(
    'INSERT INTO utilisateur (email, password, nom, prenom) VALUES (?, ?, ?, ?)',
    [email, password, nom, prenom]
  );
  return result.insertId;
};

export const findUserById = async (id) => {
  const [rows] = await pool.query('SELECT * FROM utilisateur WHERE id = ?', [id]);
  return rows[0];
};
