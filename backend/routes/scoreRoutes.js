import express from 'express';
import { addScore, fetchScore } from '../controllers/scoreController.js';
import { protect } from '../middlewares/authMiddleware.js';
const router = express.Router();

router.use(protect);
router.post('/add', addScore);
router.get('/', fetchScore);

export default router;
