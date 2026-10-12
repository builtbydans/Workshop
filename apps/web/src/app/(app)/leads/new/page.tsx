import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import CreateLeadForm from "@/components/leads/CreateLeadForm";
import { Button } from "@/components/ui/button";

const CreateLeadPage = () => {
  return (
    <main className="space-y-6 p-5">
      <Button asChild size="sm" variant="ghost">
        <Link href="/leads">
          <ArrowLeft data-icon="inline-start" />
          Back to leads
        </Link>
      </Button>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Create lead</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Record a new customer enquiry and vehicle.
        </p>
      </div>

      <CreateLeadForm />
    </main>
  );
};

export default CreateLeadPage;
