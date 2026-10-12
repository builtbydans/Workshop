import Link from "next/link";
import { CommandIcon } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

import { LoginForm } from "@/components/login-form";

export const metadata = {
  title: "Sign in · Workshop",
};
type LoginPageProps = {
  searchParams: Promise<{ error?: string }>; // Next 15+ often Promise
};
export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const showUnauthorized = params.error === "unauthorized";

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-gradient-to-b from-accent/60 via-background to-background p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        {showUnauthorized && (
          <Alert variant="destructive">
            <AlertTitle>Unauthorized</AlertTitle>
            <AlertDescription>
              Please log in to access your account.
            </AlertDescription>
          </Alert>
        )}
        <Link
          href="/login"
          className="flex items-center gap-2 self-center font-medium"
        >
          <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <CommandIcon className="size-4" />
          </div>
          Workshop
        </Link>
        <LoginForm />
      </div>
    </div>
  );
}
