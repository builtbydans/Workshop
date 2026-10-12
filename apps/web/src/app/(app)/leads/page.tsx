import Link from "next/link";
import { ClipboardList, Plus } from "lucide-react";

import { getLeads } from "@/services/lead.service.server";
import { LeadsTable } from "@/components/leads/LeadsTable";
import { Button } from "@/components/ui/button";

const LeadsPage = async () => {
  const leads = await getLeads();

  return (
    <main className="space-y-6 py-6 px-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <ClipboardList className="size-6" />
            <h1 className="text-2xl font-semibold tracking-tight">Leads</h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Review customer enquiries and manage quote progress.
          </p>
        </div>

        <Button asChild>
          <Link href="/leads/new">
            <Plus data-icon="inline-start" />
            New lead
          </Link>
        </Button>
      </div>

      <LeadsTable leads={leads} />
    </main>
  );
};

export default LeadsPage;
