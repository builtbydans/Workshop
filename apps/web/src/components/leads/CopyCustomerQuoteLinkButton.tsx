"use client";

import { useState } from "react";
import { Check, Copy, LoaderCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/api-error";
import { createCustomerQuoteLink } from "@/services/lead.service";

type CopyCustomerQuoteLinkButtonProps = {
  leadId: string;
  enabled: boolean;
};

export function CopyCustomerQuoteLinkButton({
  leadId,
  enabled,
}: CopyCustomerQuoteLinkButtonProps) {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleClick = async () => {
    if (!enabled || loading) return;

    try {
      setLoading(true);
      setCopied(false);

      const link = await createCustomerQuoteLink(leadId);

      await navigator.clipboard.writeText(link.url);
      setCopied(true);
      toast.success("Customer quote link copied");

      window.setTimeout(() => setCopied(false), 2500);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to create quote link"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      disabled={!enabled || loading}
      onClick={handleClick}
      size="sm"
      type="button"
      variant="outline"
      title={
        enabled
          ? "Copy a secure link for the customer to review this quotation"
          : "Quote the lead before sharing a customer link"
      }
    >
      {loading ? (
        <LoaderCircle className="animate-spin" data-icon="inline-start" />
      ) : copied ? (
        <Check data-icon="inline-start" />
      ) : (
        <Copy data-icon="inline-start" />
      )}
      {copied ? "Link copied" : "Copy customer quote link"}
    </Button>
  );
}
