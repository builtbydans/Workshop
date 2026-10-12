import { describe, expect, it } from "vitest";

import { JOB_STATUS } from "../../../constants/job-status";

import * as workItemService from "./work-item.service";

/**
 * Work item rules — when can costs still be edited?
 *
 * No mocks needed: canEditWorkItems is a pure function exported from the service.
 */
describe("canEditWorkItems", () => {
  it("allows edits while work is in progress", () => {
    expect(workItemService.canEditWorkItems(JOB_STATUS.IN_PROGRESS)).toBe(true);
  });

  it("locks edits once the job is ready for collection", () => {
    expect(
      workItemService.canEditWorkItems(JOB_STATUS.READY_FOR_COLLECTION),
    ).toBe(false);
  });

  it("locks edits after the job is invoiced", () => {
    expect(workItemService.canEditWorkItems(JOB_STATUS.INVOICED)).toBe(false);
  });
});

describe("summariseCosts", () => {
  it("calculates quoted vs actual and flags additional work", () => {
    const summary = workItemService.summariseCosts(
      100,
      [
        {
          id: "1",
          job_id: "job-1",
          kind: "LABOUR",
          origin: "QUOTED",
          description: "Quoted labour",
          quantity: 1,
          unit_cost: 40,
          unit_price: 50,
          line_cost: 40,
          line_total: 50,
          sort_order: 0,
          created_at: "",
          updated_at: "",
        },
        {
          id: "2",
          job_id: "job-1",
          kind: "PARTS",
          origin: "ADDITIONAL",
          description: "Extra part",
          quantity: 1,
          unit_cost: 20,
          unit_price: 30,
          line_cost: 20,
          line_total: 30,
          sort_order: 1,
          created_at: "",
          updated_at: "",
        },
      ],
      true,
    );

    expect(summary).toEqual({
      quoted: 100,
      actual: 80,
      additional: 30,
      variance: -20,
      canEdit: true,
    });
  });
});
