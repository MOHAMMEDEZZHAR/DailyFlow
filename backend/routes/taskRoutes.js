import express from 'express';
import { addTask, getTasks, updateTaskCtrl, deleteTaskCtrl } from '../controllers/taskController.js';
import { protect } from '../middlewares/authMiddleware.js';
const router = express.Router();

router.use(protect);
router.post('/', addTask);
router.get('/', getTasks);
router.put('/:taskId', updateTaskCtrl);
router.delete('/:taskId', deleteTaskCtrl);

export default router;
