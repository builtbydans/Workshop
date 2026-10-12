import Link from "next/link";
import { Wrench } from "lucide-react";

import TechnicianLoginForm from "@/components/technician/TechnicianLoginForm";

export const metadata = {
  title: "Technician sign in · Workshop",
};

export default function TechnicianLoginPage() {
  return (
    <div className="flex min-h-svh flex-col bg-gradient-to-b from-accent/60 via-background to-background p-6 md:p-10">
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-8">
        <Link
          className="flex items-center justify-center gap-2 font-medium"
          href="/technician/login"
        >
          <div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Wrench className="size-4" />
          </div>
          Workshop Floor
        </Link>
        <TechnicianLoginForm />
        <p className="text-center text-sm text-muted-foreground">
          Manager or office login?{" "}
          <Link className="underline underline-offset-4" href="/login">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
}
