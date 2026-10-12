import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TrendingUpIcon } from "lucide-react";
import { getDashboardStats } from "@/services/dashboard.service.server";
import { unstable_rethrow } from "next/navigation";
import Link from "next/link";

export async function SectionCards() {
  let stats;

  try {
    stats = await getDashboardStats();
  } catch (error) {
    unstable_rethrow(error);
    return (
      <p>Something has gone wrong with retrieving your dashboard statistics.</p>
    );
  }

  const countStats = {
    customers: stats.customers,
    vehicles: stats.vehicles,
    jobs: stats.jobs,
    leads: stats.leads,
    invoices: stats.invoices,
  };

  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      {Object.entries(countStats).map(([key, value]) => (
        <Link key={key} href={`/${key}`}>
          <Card className="@container/card">
            <CardHeader>
              <CardDescription className="capitalize">{key}</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                {value}
              </CardTitle>
              <CardAction>
                <Badge
                  variant="outline"
                  className="bg-green-200 border-green-500 text-green-700"
                >
                  <TrendingUpIcon />
                  +12.5%
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1.5 text-sm">
              <div className="line-clamp-1 flex gap-2 font-medium">
                Trending up this month <TrendingUpIcon className="size-4" />
              </div>
              <div className="text-muted-foreground">
                Overview of total {key}
              </div>
            </CardFooter>
          </Card>
        </Link>
      ))}
    </div>
  );
}
