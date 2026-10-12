"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api-error";
import { createWorkItem, deleteWorkItem } from "@/services/job.service";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  WORK_ITEM_KIND,
  WORK_ITEM_ORIGIN,
  type WorkItemKind,
} from "@/types/work-item.types";
import type { JobSummaryDto } from "@/types/job.types";

const money = (value: number) =>
  `£${Number(value).toLocaleString("en-GB", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const kindLabel: Record<WorkItemKind, string> = {
  LABOUR: "Labour",
  PARTS: "Parts",
  MATERIALS: "Materials",
};

interface WorkItemsPanelProps {
  job: JobSummaryDto;
  onCreate?: typeof createWorkItem;
  onDelete?: typeof deleteWorkItem;
  onUpdated?: (job: JobSummaryDto) => void;
}

const WorkItemsPanel = ({
  job,
  onCreate,
  onDelete,
  onUpdated,
}: WorkItemsPanelProps) => {
  const router = useRouter();
  const items = job.workItems ?? [];
  const costs = job.costs;
  const canEdit = costs?.canEdit ?? false;
  const [kind, setKind] = useState<WorkItemKind>(WORK_ITEM_KIND.LABOUR);
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [unitCost, setUnitCost] = useState("0");
  const [unitPrice, setUnitPrice] = useState("");
  const [additional, setAdditional] = useState(false);
  const [pending, setPending] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const applyUpdate = (updated: JobSummaryDto) => {
    if (onUpdated) {
      onUpdated(updated);
      return;
    }

    router.refresh();
  };

  const resetForm = () => {
    setDescription("");
    setQuantity("1");
    setUnitCost("0");
    setUnitPrice("");
    setAdditional(false);
  };

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);
    setError(null);

    try {
      const updated = await (onCreate ?? createWorkItem)(job.id, {
        kind,
        origin: additional
          ? WORK_ITEM_ORIGIN.ADDITIONAL
          : WORK_ITEM_ORIGIN.QUOTED,
        description: description.trim().toUpperCase(),
        quantity: Number(quantity),
        unit_cost: Number(unitCost || 0),
        unit_price: Number(unitPrice),
      });
      resetForm();
      toast.success("Work item added");
      applyUpdate(updated);
    } catch (err) {
      setError(getErrorMessage(err, "Unable to add work item"));
    } finally {
      setPending(false);
    }
  };

  const handleDelete = async (itemId: string) => {
    setDeletingId(itemId);
    setError(null);

    try {
      const updated = await (onDelete ?? deleteWorkItem)(job.id, itemId);
      toast.success("Work item removed");
      applyUpdate(updated);
    } catch (err) {
      setError(getErrorMessage(err, "Unable to remove work item"));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Labour, parts and materials</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {costs && (
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border p-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Quoted
              </p>
              <p className="mt-1 text-lg font-semibold">
                {money(costs.quoted)}
              </p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Actual
              </p>
              <p className="mt-1 text-lg font-semibold">
                {money(costs.actual)}
              </p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Variance
              </p>
              <p className="mt-1 text-lg font-semibold">
                {costs.variance > 0 ? "+" : ""}
                {money(costs.variance)}
              </p>
              {costs.additional > 0 && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Includes {money(costs.additional)} additional work
                </p>
              )}
            </div>
          </div>
        )}

        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No labour, parts or materials recorded yet.
          </p>
        ) : (
          <div className="overflow-hidden rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 font-medium">Item</th>
                  <th className="px-3 py-2 font-medium">Qty</th>
                  <th className="px-3 py-2 text-right font-medium">Total</th>
                  {canEdit && <th className="px-3 py-2" />}
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr className="border-t" key={item.id}>
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium">{item.description}</span>
                        <Badge variant="outline">{kindLabel[item.kind]}</Badge>
                        {item.origin === "ADDITIONAL" && (
                          <Badge variant="secondary">Additional</Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2 tabular-nums">{item.quantity}</td>
                    <td className="px-3 py-2 text-right tabular-nums">
                      {money(item.line_total)}
                    </td>
                    {canEdit && (
                      <td className="px-3 py-2 text-right">
                        <Button
                          disabled={deletingId !== null}
                          onClick={() => void handleDelete(item.id)}
                          size="icon"
                          type="button"
                          variant="ghost"
                        >
                          {deletingId === item.id ? (
                            <LoaderCircle className="animate-spin" />
                          ) : (
                            <Trash2 />
                          )}
                        </Button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {canEdit ? (
          <form
            className="space-y-3 rounded-lg border p-4"
            onSubmit={handleCreate}
          >
            <p className="text-sm font-medium">Add a line</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="work-item-kind">Type</Label>
                <Select
                  onValueChange={(value) => setKind(value as WorkItemKind)}
                  value={kind}
                >
                  <SelectTrigger className="w-full" id="work-item-kind">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={WORK_ITEM_KIND.LABOUR}>
                      Labour
                    </SelectItem>
                    <SelectItem value={WORK_ITEM_KIND.PARTS}>Parts</SelectItem>
                    <SelectItem value={WORK_ITEM_KIND.MATERIALS}>
                      Materials
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="work-item-description">Description</Label>
                <Input
                  id="work-item-description"
                  maxLength={500}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Front side tints, 2 hours labour…"
                  required
                  value={description}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="work-item-qty">Quantity</Label>
                <Input
                  id="work-item-qty"
                  min="0.01"
                  onChange={(event) => setQuantity(event.target.value)}
                  required
                  step="0.01"
                  type="number"
                  value={quantity}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="work-item-price">Billable unit price</Label>
                <Input
                  id="work-item-price"
                  min="0"
                  onChange={(event) => setUnitPrice(event.target.value)}
                  placeholder="0.00"
                  required
                  step="0.01"
                  type="number"
                  value={unitPrice}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="work-item-cost">Unit cost (optional)</Label>
                <Input
                  id="work-item-cost"
                  min="0"
                  onChange={(event) => setUnitCost(event.target.value)}
                  step="0.01"
                  type="number"
                  value={unitCost}
                />
              </div>
              <label className="flex items-center gap-2 self-end pb-1 text-sm">
                <Checkbox
                  checked={additional}
                  onCheckedChange={(value) => setAdditional(value === true)}
                />
                Additional work, not on the original quote
              </label>
            </div>
            <div className="flex justify-end">
              <Button disabled={pending} type="submit">
                {pending ? <LoaderCircle className="animate-spin" /> : <Plus />}
                Add item
              </Button>
            </div>
          </form>
        ) : (
          <p className="text-sm text-muted-foreground">
            Work items are locked after final inspection.
          </p>
        )}

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default WorkItemsPanel;
