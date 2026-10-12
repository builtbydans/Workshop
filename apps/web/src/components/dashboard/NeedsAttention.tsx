"use client";

import { MessageSquareWarning } from "lucide-react";

import { AttentionRaisesList } from "@/components/manager-attention/AttentionRaisesList";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import type { DashboardRaiseDto } from "@/types/job-raise.types";

export function NeedsAttention({ raises }: { raises: DashboardRaiseDto[] }) {
  const hasRaises = raises.length > 0;

  return (
    <Card
      className={
        hasRaises
          ? "border-red-300 bg-red-50/70 dark:border-red-900 dark:bg-red-950/30"
          : undefined
      }
    >
      <CardContent className="px-5 pt-2 sm:px-6">
        <Accordion
          defaultValue={hasRaises ? ["needs-attention"] : []}
          type="multiple"
        >
          <AccordionItem className="border-none" value="needs-attention">
            <AccordionTrigger className="hover:no-underline">
              <span className="flex w-full items-center justify-between gap-4 pr-2">
                <span className="flex min-w-0 flex-col items-start gap-1 text-left">
                  <span className="flex items-center gap-2 text-base font-semibold">
                    <MessageSquareWarning
                      className={
                        hasRaises
                          ? "size-4 text-red-600 dark:text-red-400"
                          : "size-4"
                      }
                    />
                    Needs attention
                  </span>
                  <span className="text-sm font-normal text-muted-foreground">
                    Outstanding technician raises awaiting manager attention
                  </span>
                </span>
                <span
                  className={
                    hasRaises
                      ? "rounded-md bg-red-100 px-2 py-1 text-sm font-semibold tabular-nums text-red-800 dark:bg-red-950 dark:text-red-200"
                      : "rounded-md bg-muted px-2 py-1 text-sm font-semibold tabular-nums"
                  }
                >
                  {raises.length}
                </span>
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <AttentionRaisesList raises={raises} />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
