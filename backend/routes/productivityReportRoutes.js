import express from 'express';
import { getCompletedTasksPerDay } from '../controllers/productivityReportController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// GET /api/report/completed-per-day
router.get('/completed-per-day', protect, getCompletedTasksPerDay);

export default router;
