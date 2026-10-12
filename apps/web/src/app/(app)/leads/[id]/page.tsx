import { getLeadById } from "@/services/lead.service.server";
import { LeadDetailsCard } from "@/components/leads/LeadDetailsCard";

interface LeadPageProps {
  params: Promise<{
    id: string;
  }>;
}

const LeadPage = async ({ params }: LeadPageProps) => {
  const { id } = await params;

  const lead = await getLeadById(id);

  return (
    <main className="p-5">
      <LeadDetailsCard lead={lead} />
    </main>
  );
};

export default LeadPage;
