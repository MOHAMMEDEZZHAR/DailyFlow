import express from 'express';
import { addSlot, getSlots, updateSlotCtrl, deleteSlotCtrl } from '../controllers/availabilityController.js';
import { protect } from '../middlewares/authMiddleware.js';
const router = express.Router();

router.use(protect);
router.post('/', addSlot);
router.get('/', getSlots);
router.put('/:slotId', updateSlotCtrl);
router.delete('/:slotId', deleteSlotCtrl);

export default router;
