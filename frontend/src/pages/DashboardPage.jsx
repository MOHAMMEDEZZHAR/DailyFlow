import React from "react";
import TaskManager from "../sections/TaskManager";
import AvailabilityManager from "../sections/AvailabilityManager";
import EnergyManager from "../sections/EnergyManager";
import ScheduleManager from "../sections/ScheduleManager";

const DashboardPage = () => {
  return (
    <div className="max-w-6xl mx-auto py-8 px-2 md:px-0 flex flex-col gap-8">
      <h1 className="text-3xl font-bold mb-2">Mon planning intelligent</h1>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="flex flex-col gap-8">
          <TaskManager />
          <AvailabilityManager />
          <EnergyManager />
        </div>
        <div>
          <ScheduleManager />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
