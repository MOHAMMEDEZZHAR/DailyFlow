import express from 'express';
import { setEnergy, getEnergy } from '../controllers/energyController.js';
import { protect } from '../middlewares/authMiddleware.js';
const router = express.Router();

router.use(protect);
router.post('/', setEnergy);
router.get('/', getEnergy);

export default router;
