import axios from './axios';

export const fetchCompletedTasksPerDay = async () => {
  const res = await axios.get('/report/completed-per-day');
  return res.data;
};
