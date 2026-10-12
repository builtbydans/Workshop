"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api-error";
import { markLeadAsLost } from "@/services/lead.service";
import { Button } from "../ui/button";

interface MarkLeadLostProps {
  leadId: string;
}

const MarkLeadLostButton = ({ leadId }: MarkLeadLostProps) => {
  const router = useRouter();

  const handleClick = async () => {
    try {
      await markLeadAsLost(leadId);
      toast.success("Lead marked as lost");
      router.refresh();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to mark lead as lost"));
    }
  };

  return (
    <Button variant="destructive" onClick={handleClick}>
      Mark As Lost
    </Button>
  );
};

export default MarkLeadLostButton;
