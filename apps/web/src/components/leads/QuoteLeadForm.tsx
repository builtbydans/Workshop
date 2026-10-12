"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { getErrorMessage } from "@/lib/api-error";
import { quoteLead } from "@/services/lead.service";
import { QuoteLeadDto } from "@/types/lead.types";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface QuoteLeadFormProps {
  leadId: string;
}

export const QuoteLeadForm = ({ leadId }: QuoteLeadFormProps) => {
  const router = useRouter();
  const [jobType, setJobType] = useState("");
  const [quotedCost, setQuotedCost] = useState("");

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    const quoteData: QuoteLeadDto = {
      job_type: jobType,
      quoted_cost: Number(quotedCost),
    };

    try {
      await quoteLead(leadId, quoteData);

      toast.success("Quote has been successfully sent to customer");
      router.refresh();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to send quote"));
    }
  };
  return (
    <div className="rounded-lg border p-6 space-y-4">
      <h2 className="text-lg font-semibold">Quote Lead</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium">Job Type</label>

          <Input
            value={jobType}
            onChange={(e) => setJobType(e.target.value)}
            placeholder="PPF"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Quoted Cost (£)</label>

          <Input
            type="number"
            value={quotedCost}
            onChange={(e) => setQuotedCost(e.target.value)}
            placeholder="2500"
          />
        </div>

        <Button type="submit">Send Quote</Button>
      </form>
    </div>
  );
};
