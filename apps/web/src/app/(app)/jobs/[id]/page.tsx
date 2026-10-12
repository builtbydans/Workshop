import JobDetailsCard from "@/components/jobs/JobDetailsCard";
import { requireServerAuth } from "@/lib/server-auth";
import { getEmployees } from "@/services/employee.service.server";
import { getJobById } from "@/services/job.service.server";

const JobDetailsPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  const auth = await requireServerAuth();
  const isTechnician = auth.role === "TECHNICIAN";

  const [job, employees] = await Promise.all([
    getJobById(id),
    isTechnician ? Promise.resolve([]) : getEmployees(),
  ]);
  const technicians = employees.filter(
    (employee) => employee.role === "TECHNICIAN",
  );

  return (
    <JobDetailsCard
      job={job}
      technicians={technicians}
      viewerRole={auth.role}
    />
  );
};

export default JobDetailsPage;
