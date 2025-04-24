import express from 'express';
import { generateUserSchedule, getUserSchedule, updateScheduleEntryCtrl } from '../controllers/scheduleController.js';
import { protect } from '../middlewares/authMiddleware.js';
const router = express.Router();

router.use(protect);
router.post('/generate', generateUserSchedule);
router.get('/', getUserSchedule);
router.put('/:id', updateScheduleEntryCtrl);

export default router;
