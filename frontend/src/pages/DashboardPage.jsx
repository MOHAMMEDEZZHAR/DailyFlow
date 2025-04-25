import React, { useEffect, useState } from "react";
import TaskManager from "../sections/TaskManager";
import AvailabilityManager from "../sections/AvailabilityManager";
import EnergyManager from "../sections/EnergyManager";
import ScheduleManager from "../sections/ScheduleManager";
import axios from "../api/axios";

const DashboardPage = () => {
  const [score, setScore] = useState(null);
  const fetchScore = () => {
    axios.get("/score/").then(res => setScore(res.data.score)).catch(() => setScore(null));
  };
  useEffect(() => {
    fetchScore();
  }, []);
  return (
    <div className="max-w-6xl mx-auto py-8 px-2 md:px-0 flex flex-col gap-8">
      <h1 className="text-3xl font-bold mb-2">Mon planning intelligent</h1>
      <div className="mb-4">
        <span className="text-lg font-semibold">Score de productivité : </span>
        <span className="text-2xl font-bold text-green-700">{score !== null ? score : '...'}</span>
      </div>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="flex flex-col gap-8">
          <TaskManager />
          <AvailabilityManager />
          <EnergyManager />
        </div>
        <div>
          <ScheduleManager score={score} onScoreChange={fetchScore} />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
