"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LoaderCircle, UserRound } from "lucide-react";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api-error";
import { assignTechnician } from "@/services/job.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { EmployeeDto } from "@/types/employee.types";
import type { JobSummaryDto } from "@/types/job.types";

interface AssignmentPanelProps {
  job: JobSummaryDto;
  technicians: EmployeeDto[];
}

const UNASSIGNED = "unassigned";

const AssignmentPanel = ({ job, technicians }: AssignmentPanelProps) => {
  const router = useRouter();
  const [technicianId, setTechnicianId] = useState(
    job.assigned_technician_id ?? UNASSIGNED,
  );
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);

    try {
      await assignTechnician(
        job.id,
        technicianId === UNASSIGNED ? null : technicianId,
      );
      toast.success("Technician assignment updated");
      router.refresh();
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to assign technician"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserRound className="size-4 text-muted-foreground" />
          Assigned technician
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select onValueChange={setTechnicianId} value={technicianId}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Choose a technician" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={UNASSIGNED}>Unassigned</SelectItem>
            {technicians.map((technician) => (
              <SelectItem key={technician.id} value={technician.id}>
                {technician.first_name} {technician.last_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button disabled={saving} onClick={() => void handleSave()} type="button">
          {saving && <LoaderCircle className="animate-spin" />}
          {saving ? "Saving..." : "Save assignment"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default AssignmentPanel;
