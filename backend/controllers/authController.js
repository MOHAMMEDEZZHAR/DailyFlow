import bcrypt from 'bcrypt';
import { generateToken } from '../utils/jwt.js';
import { findUserByEmail, createUser } from '../models/userModel.js';

export const register = async (req, res, next) => {
  try {
    const { email, password, nom, prenom } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email et mot de passe requis' });
    }
    const userExists = await findUserByEmail(email);
    if (userExists) {
      return res.status(409).json({ message: 'Utilisateur déjà existant' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const userId = await createUser({ email, password: hashed, nom, prenom });
    const token = generateToken(userId);
    res.status(201).json({ token });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Identifiants invalides' });
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: 'Identifiants invalides' });
    }
    const token = generateToken(user.id);
    res.json({ token });
  } catch (err) {
    next(err);
  }
};
