import { LeadSummaryDto } from "@/types/lead.types";
import { QuoteLeadForm } from "./QuoteLeadForm";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatRegistration } from "@/utils/formatRegistration";

import MarkLeadLostButton from "./MarkLeadLostButton";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  CarFront,
  Mail,
  MessageSquareText,
  Phone,
  UserRound,
} from "lucide-react";

interface LeadDetailsCardProps {
  lead: LeadSummaryDto;
}

export const LeadDetailsCard = ({ lead }: LeadDetailsCardProps) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button asChild size="sm" variant="ghost">
          <Link href="/leads">
            <ArrowLeft data-icon="inline-start" />
            Back to leads
          </Link>
        </Button>

        {["LEAD", "QUOTED"].includes(lead.status) && (
          <MarkLeadLostButton leadId={lead.id} />
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <CardTitle className="text-xl">{lead.job_number}</CardTitle>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                <CalendarDays className="size-4" />
                Created {new Date(lead.created_at).toLocaleDateString("en-GB")}
              </p>
            </div>
            <StatusBadge status={lead.status} />
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserRound className="size-4 text-muted-foreground" />
              Customer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="font-medium">
              {lead.vehicles.customers.first_name}{" "}
              {lead.vehicles.customers.last_name}
            </p>
            <p className="flex items-center gap-2">
              <Mail className="size-4 text-muted-foreground" />
              {lead.vehicles.customers.email}
            </p>
            <p className="flex items-center gap-2">
              <Phone className="size-4 text-muted-foreground" />
              {lead.vehicles.customers.phone}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CarFront className="size-4 text-muted-foreground" />
              Vehicle
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="font-medium">
              {lead.vehicles.make} {lead.vehicles.model}
            </p>
            <div className="inline-flex rounded-md border bg-muted/40 px-3 py-1.5 font-mono text-sm font-semibold tracking-wider">
              {formatRegistration(lead.vehicles.registration)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lead details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Job type
            </p>
            <p className="mt-1 font-medium">
              {lead.job_type ?? "Not assigned"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Quoted cost
            </p>
            <p className="mt-1 font-medium">
              {lead.quoted_cost ? `£${lead.quoted_cost}` : "Not quoted"}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquareText className="size-4 text-muted-foreground" />
            Customer message
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
            {lead.description}
          </p>
        </CardContent>
      </Card>

      {lead.status === "LEAD" && <QuoteLeadForm leadId={lead.id} />}
    </div>
  );
};
