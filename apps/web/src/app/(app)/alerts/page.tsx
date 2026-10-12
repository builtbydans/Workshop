import { redirect } from "next/navigation";
import { Bell } from "lucide-react";

import { AttentionRaisesList } from "@/components/manager-attention/AttentionRaisesList";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireServerAuth } from "@/lib/server-auth";
import { getOutstandingRaises } from "@/services/manager-attention.service.server";

const AlertsPage = async () => {
  const auth = await requireServerAuth();

  if (auth.role !== "MANAGER" && auth.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const raises = await getOutstandingRaises();

  return (
    <main className="space-y-6 px-4 py-6 sm:px-6 lg:px-12">
      <div>
        <div className="flex items-center gap-2">
          <Bell className="size-6" />
          <h1 className="text-2xl font-semibold tracking-tight">Alerts</h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Technician escalations that need manager attention.
        </p>
      </div>

      <Card
        className={
          raises.length > 0
            ? "border-red-300 bg-red-50/70 dark:border-red-900 dark:bg-red-950/30"
            : undefined
        }
      >
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle>Needs attention</CardTitle>
            <CardDescription>
              Outstanding technician raises awaiting manager attention
            </CardDescription>
          </div>
          <span
            className={
              raises.length > 0
                ? "rounded-md bg-red-100 px-2 py-1 text-sm font-semibold tabular-nums text-red-800 dark:bg-red-950 dark:text-red-200"
                : "rounded-md bg-muted px-2 py-1 text-sm font-semibold tabular-nums"
            }
          >
            {raises.length}
          </span>
        </CardHeader>
        <CardContent>
          <AttentionRaisesList raises={raises} />
        </CardContent>
      </Card>
    </main>
  );
};

export default AlertsPage;
