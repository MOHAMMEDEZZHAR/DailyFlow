import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import availabilityRoutes from './routes/availabilityRoutes.js';
import energyRoutes from './routes/energyRoutes.js';
import scheduleRoutes from './routes/scheduleRoutes.js';
import scoreRoutes from './routes/scoreRoutes.js';
import { errorHandler } from './middlewares/errorMiddleware.js';
import productivityReportRoutes from './routes/productivityReportRoutes.js';

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/energy', energyRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use('/api/score', scoreRoutes);
app.use('/api/report', productivityReportRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
