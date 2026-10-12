import JobDetailsCard from "@/components/jobs/JobDetailsCard";
import { getEmployees } from "@/services/employee.service.server";
import { getJobById } from "@/services/job.service.server";

const JobDetailsPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  const [job, employees] = await Promise.all([getJobById(id), getEmployees()]);
  const technicians = employees.filter(
    (employee) => employee.role === "TECHNICIAN",
  );

  return (
    <>
      <JobDetailsCard job={job} technicians={technicians} />
    </>
  );
};

export default JobDetailsPage;
