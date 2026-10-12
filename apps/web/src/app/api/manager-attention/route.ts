import { requireAuth } from "@/server/lib/auth";
import { handleRoute, json } from "@/server/lib/http";
import * as jobRaiseService from "@/server/modules/job/raises/job-raise.service";

export async function GET(request: Request) {
  return handleRoute(async () => {
    const auth = await requireAuth(request);
    const wantsCountOnly = new URL(request.url).searchParams.get("count") === "1";

    if (wantsCountOnly) {
      const count = await jobRaiseService.getOutstandingRaiseCountForManager(
        auth.role,
      );
      return json(200, { count });
    }

    const raises = await jobRaiseService.getOutstandingRaisesForManager(
      auth.role,
    );
    return json(200, raises);
  });
}
