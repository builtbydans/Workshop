import Link from "next/link";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="max-w-md text-center">
        <p className="text-sm font-medium text-primary">404</p>

        <h1 className="mt-2 text-3xl font-bold">Page Not Found</h1>

        <p className="mt-3 text-muted-foreground">
          The page or Workshop record you requested could not be found.
        </p>

        <Button asChild className="mt-6">
          <Link href="/dashboard">Return to Dashboard</Link>
        </Button>
      </div>
    </main>
  );
};

export default NotFound;
