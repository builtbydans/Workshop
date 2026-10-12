export const WORK_ITEM_KIND = {
  LABOUR: "LABOUR",
  PARTS: "PARTS",
  MATERIALS: "MATERIALS",
} as const;

export type WorkItemKind =
  (typeof WORK_ITEM_KIND)[keyof typeof WORK_ITEM_KIND];

export const WORK_ITEM_ORIGIN = {
  QUOTED: "QUOTED",
  ADDITIONAL: "ADDITIONAL",
} as const;

export type WorkItemOrigin =
  (typeof WORK_ITEM_ORIGIN)[keyof typeof WORK_ITEM_ORIGIN];

export interface WorkItemDto {
  id: string;
  job_id: string;
  kind: WorkItemKind;
  origin: WorkItemOrigin;
  description: string;
  quantity: number;
  unit_cost: number;
  unit_price: number;
  line_cost: number;
  line_total: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface JobCostSummaryDto {
  quoted: number;
  actual: number;
  additional: number;
  variance: number;
  canEdit: boolean;
}

export interface CreateWorkItemDto {
  kind: WorkItemKind;
  origin?: WorkItemOrigin;
  description: string;
  quantity: number;
  unit_cost?: number;
  unit_price: number;
}

export interface UpdateWorkItemDto {
  kind?: WorkItemKind;
  origin?: WorkItemOrigin;
  description?: string;
  quantity?: number;
  unit_cost?: number;
  unit_price?: number;
}
