import { describe, expect, it } from "vitest";
import {
  JOB_STATUS,
  getAllowedActions,
  getAllowedNextStatuses,
} from "./job-status";

describe("getAllowedNextStatuses", () => {
  it("lets a manager move from BOOKED to IN_PROGRESS", () => {
    const next = getAllowedNextStatuses(JOB_STATUS.BOOKED, "MANAGER");
    expect(next).toContain(JOB_STATUS.IN_PROGRESS);
  });
});

describe("getAllowedActions — manager from BOOKED", () => {
  it("allows IN_PROGRESS as a normal transition", () => {
    const actions = getAllowedActions(JOB_STATUS.BOOKED, "MANAGER");

    expect(actions).toContainEqual({
      targetStatus: JOB_STATUS.IN_PROGRESS,
      requiresReason: false,
      isOverride: false,
    });
  });

  it("marks COMPLETED as an override that requires a reason", () => {
    const actions = getAllowedActions(JOB_STATUS.BOOKED, "MANAGER");

    expect(actions).toContainEqual({
      targetStatus: JOB_STATUS.COMPLETED,
      requiresReason: true,
      isOverride: true,
    });
  });

  it("does not offer COMPLETED to a technician from BOOKED", () => {
    const actions = getAllowedActions(JOB_STATUS.BOOKED, "TECHNICIAN");

    expect(actions.map((action) => action.targetStatus)).not.toContain(
      JOB_STATUS.COMPLETED,
    );
  });
});

describe("getAllowedActions — technician from BOOKED", () => {
  it("offers only the normal workshop next steps", () => {
    const actions = getAllowedActions(JOB_STATUS.BOOKED, "TECHNICIAN");

    expect(actions.map((action) => action.targetStatus)).toEqual(
      expect.arrayContaining([
        JOB_STATUS.AWAITING_PARTS,
        JOB_STATUS.IN_PROGRESS,
      ]),
    );
    expect(actions.every((action) => action.isOverride === false)).toBe(true);
  });
});
