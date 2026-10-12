import * as dashboardRepository from "./dashboard.repository";
import * as jobRaiseService from "../job/raises/job-raise.service";

const getDashboardStats = async () => {
  const [stats, openRaises] = await Promise.all([
    dashboardRepository.getDashboardStats(),
    jobRaiseService.getOpenRaisesForDashboard(),
  ]);

  return {
    ...stats,
    openRaises,
    openRaiseCount: openRaises.length,
  };
};

export { getDashboardStats };
