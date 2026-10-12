"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Delete, LoaderCircle } from "lucide-react";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api-error";
import { setWorkshopSession } from "@/lib/workshop-session";
import {
  clockInTechnician,
  fetchWorkshopTechnicians,
} from "@/services/workshop.api";
import { Button } from "@/components/ui/button";
import type { WorkshopTechnicianDto } from "@/types/employee.types";
import { cn } from "@/lib/utils";

const PIN_LENGTH = 5;
const NUMPAD = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "back"];

const TechnicianLoginForm = () => {
  const router = useRouter();
  const [technicians, setTechnicians] = useState<WorkshopTechnicianDto[]>([]);
  const [loadingTechnicians, setLoadingTechnicians] = useState(true);
  const [selectedTechnician, setSelectedTechnician] =
    useState<WorkshopTechnicianDto | null>(null);
  const [pin, setPin] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setTechnicians(await fetchWorkshopTechnicians());
      } catch (error) {
        toast.error(getErrorMessage(error, "Unable to load technicians"));
      } finally {
        setLoadingTechnicians(false);
      }
    };

    void load();
  }, []);

  const handleDigit = (digit: string) => {
    setPin((current) =>
      current.length < PIN_LENGTH ? `${current}${digit}` : current,
    );
  };

  const handleSubmit = async (nextPin = pin) => {
    if (!selectedTechnician || nextPin.length !== PIN_LENGTH || submitting) {
      return;
    }

    setSubmitting(true);

    try {
      const session = await clockInTechnician(selectedTechnician.id, nextPin);
      setWorkshopSession({
        token: session.token,
        employee: {
          id: session.employee.id,
          first_name: session.employee.first_name,
          last_name: session.employee.last_name,
          role: session.employee.role,
        },
      });
      toast.success(`Welcome, ${session.employee.first_name}`);
      router.replace("/technician");
    } catch (error) {
      setPin("");
      toast.error(getErrorMessage(error, "Invalid PIN"));
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (pin.length === PIN_LENGTH) {
      void handleSubmit(pin);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin]);

  if (loadingTechnicians) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-muted-foreground">
        <LoaderCircle className="size-6 animate-spin" />
      </div>
    );
  }

  if (!selectedTechnician) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Workshop floor
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Who&apos;s working?
          </h1>
          <p className="mt-2 text-muted-foreground">
            Choose your name, then enter your 5-digit PIN.
          </p>
        </div>

        {technicians.length === 0 ? (
          <p className="rounded-xl border bg-card p-6 text-center text-muted-foreground">
            No technicians are set up yet. Ask a manager to create a technician
            with a PIN.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {technicians.map((technician) => (
              <button
                className="rounded-2xl border bg-card p-6 text-left text-xl font-semibold shadow-sm transition-colors hover:border-primary hover:bg-muted/40"
                key={technician.id}
                onClick={() => setSelectedTechnician(technician)}
                type="button"
              >
                {technician.first_name} {technician.last_name}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-sm space-y-8">
      <div className="text-center">
        <p className="text-sm text-muted-foreground">Signing in as</p>
        <h1 className="mt-1 text-3xl font-semibold">
          {selectedTechnician.first_name} {selectedTechnician.last_name}
        </h1>
        <Button
          className="mt-3"
          onClick={() => {
            setSelectedTechnician(null);
            setPin("");
          }}
          type="button"
          variant="ghost"
        >
          Choose someone else
        </Button>
      </div>

      <div className="flex justify-center gap-3">
        {Array.from({ length: PIN_LENGTH }).map((_, index) => (
          <span
            className={cn(
              "size-4 rounded-full border-2",
              index < pin.length
                ? "border-primary bg-primary"
                : "border-muted-foreground/40",
            )}
            key={index}
          />
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3">
        {NUMPAD.map((key, index) => {
          if (key === "") {
            return <div key={`empty-${index}`} />;
          }

          if (key === "back") {
            return (
              <Button
                className="h-16 text-lg"
                disabled={submitting}
                key="back"
                onClick={() => setPin((current) => current.slice(0, -1))}
                type="button"
                variant="outline"
              >
                <Delete className="size-5" />
              </Button>
            );
          }

          return (
            <Button
              className="h-16 text-2xl"
              disabled={submitting}
              key={key}
              onClick={() => handleDigit(key)}
              type="button"
              variant="outline"
            >
              {key}
            </Button>
          );
        })}
      </div>

      {submitting && (
        <p className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <LoaderCircle className="size-4 animate-spin" />
          Checking PIN...
        </p>
      )}
    </div>
  );
};

export default TechnicianLoginForm;
