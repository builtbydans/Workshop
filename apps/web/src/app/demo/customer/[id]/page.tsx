import { notFound } from "next/navigation";

import { CustomerLeadView } from "@/components/demo/customer/CustomerLeadView";
import { getLeadById } from "@/services/lead.service.server";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function CustomerSimulationLeadPage({ params }: PageProps) {
  const { id } = await params;

  let lead;

  try {
    lead = await getLeadById(id);
  } catch {
    notFound();
  }

  if (!lead) {
    notFound();
  }

  return <CustomerLeadView lead={lead} />;
}
