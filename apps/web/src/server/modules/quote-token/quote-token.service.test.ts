import { beforeEach, describe, expect, it, vi } from "vitest";

import { JOB_STATUS } from "../../constants/job-status";
import { ERROR_CODES } from "../../errors/AppError";
import { hashToken } from "../../lib/token-crypto";

const quoteTokenRepository = {
  createQuoteToken: vi.fn(),
  findByTokenHash: vi.fn(),
  findActiveByJobId: vi.fn(),
  revokeActiveTokensForJob: vi.fn(),
  markResponded: vi.fn(),
};

const jobRepository = {
  getLeadById: vi.fn(),
};

const jobService = {
  acceptQuote: vi.fn(),
  markLeadAsLost: vi.fn(),
};

vi.mock("./quote-token.repository", () => quoteTokenRepository);
vi.mock("../job/job.repository", () => jobRepository);
vi.mock("../job/job.service", () => jobService);

const quoteTokenService = await import("./quote-token.service");

const JOB_ID = "job-1";
const TOKEN = "abcdefghijklmnopqrstuvwxyz0123456789ABC";
const TOKEN_HASH = hashToken(TOKEN);

const quotedLead = {
  id: JOB_ID,
  job_number: "JOB-2026-000010",
  status: JOB_STATUS.QUOTED,
  description: "Brake pads worn",
  job_type: "Brakes",
  quoted_cost: 240,
  vehicles: {
    registration: "AB12CDE",
    make: "FORD",
    model: "FOCUS",
    customers: {
      first_name: "Sam",
      last_name: "Taylor",
      email: "sam@example.com",
      phone: "07000000000",
    },
  },
};

const activeToken = {
  id: "tok-1",
  job_id: JOB_ID,
  token_hash: TOKEN_HASH,
  expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  revoked_at: null,
  responded_at: null,
  response: null,
  decline_reason: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("createOrRotateQuoteLink", () => {
  it("creates a hashed token link for a quoted lead", async () => {
    jobRepository.getLeadById.mockResolvedValue(quotedLead);
    quoteTokenRepository.revokeActiveTokensForJob.mockResolvedValue(undefined);
    quoteTokenRepository.createQuoteToken.mockResolvedValue(activeToken);

    const result = await quoteTokenService.createOrRotateQuoteLink(JOB_ID);

    expect(result.url).toMatch(/\/demo\/garage\/quote\/[A-Za-z0-9_-]+$/);
    expect(result.job_number).toBe("JOB-2026-000010");
    expect(quoteTokenRepository.revokeActiveTokensForJob).toHaveBeenCalledWith(
      JOB_ID,
    );
    expect(quoteTokenRepository.createQuoteToken).toHaveBeenCalledWith(
      expect.objectContaining({
        job_id: JOB_ID,
        token_hash: expect.any(String),
      }),
    );
    // Never persist the plaintext path segment as the hash argument.
    const storedHash =
      quoteTokenRepository.createQuoteToken.mock.calls[0][0].token_hash;
    expect(storedHash).not.toContain("demo/garage/quote");
  });

  it("rejects link creation when the lead is not quoted", async () => {
    jobRepository.getLeadById.mockResolvedValue({
      ...quotedLead,
      status: JOB_STATUS.LEAD,
    });

    await expect(
      quoteTokenService.createOrRotateQuoteLink(JOB_ID),
    ).rejects.toMatchObject({
      statusCode: 400,
    });
  });
});

describe("getPublicQuoteByToken", () => {
  it("returns awaiting quote details for a valid token", async () => {
    quoteTokenRepository.findByTokenHash.mockResolvedValue(activeToken);
    jobRepository.getLeadById.mockResolvedValue(quotedLead);

    const view = await quoteTokenService.getPublicQuoteByToken(TOKEN);

    expect(view.state).toBe("AWAITING");
    expect(view.quote?.quote_reference).toBe("JOB-2026-000010");
    expect(view.quote?.gross).toBe(240);
    expect(view.quote?.vat_rate).toBe(20);
    expect(view.quote?.customer_first_name).toBe("Sam");
    // No email/phone in public payload
    expect(JSON.stringify(view)).not.toContain("sam@example.com");
  });

  it("returns invalid for unknown tokens", async () => {
    quoteTokenRepository.findByTokenHash.mockResolvedValue(null);

    const view = await quoteTokenService.getPublicQuoteByToken(TOKEN);
    expect(view.state).toBe("INVALID");
    expect(view.quote).toBeNull();
  });

  it("returns expired when the token is past expiry", async () => {
    quoteTokenRepository.findByTokenHash.mockResolvedValue({
      ...activeToken,
      expires_at: new Date(Date.now() - 1000).toISOString(),
    });
    jobRepository.getLeadById.mockResolvedValue(quotedLead);

    const view = await quoteTokenService.getPublicQuoteByToken(TOKEN);
    expect(view.state).toBe("EXPIRED");
  });
});

describe("acceptPublicQuote", () => {
  it("accepts a quoted lead via the existing accept service", async () => {
    quoteTokenRepository.findByTokenHash.mockResolvedValue(activeToken);
    jobRepository.getLeadById
      .mockResolvedValueOnce(quotedLead)
      .mockResolvedValueOnce({
        ...quotedLead,
        status: JOB_STATUS.AWAITING_DEPOSIT,
      });
    jobService.acceptQuote.mockResolvedValue({
      ...quotedLead,
      status: JOB_STATUS.AWAITING_DEPOSIT,
    });
    quoteTokenRepository.markResponded.mockResolvedValue({
      ...activeToken,
      response: "ACCEPTED",
      responded_at: new Date().toISOString(),
    });

    const view = await quoteTokenService.acceptPublicQuote(TOKEN);

    expect(jobService.acceptQuote).toHaveBeenCalledWith(JOB_ID);
    expect(quoteTokenRepository.markResponded).toHaveBeenCalledWith(
      "tok-1",
      "ACCEPTED",
    );
    expect(view.state).toBe("ACCEPTED");
  });

  it("is idempotent when already accepted", async () => {
    quoteTokenRepository.findByTokenHash.mockResolvedValue({
      ...activeToken,
      response: "ACCEPTED",
      responded_at: new Date().toISOString(),
    });
    jobRepository.getLeadById.mockResolvedValue({
      ...quotedLead,
      status: JOB_STATUS.AWAITING_DEPOSIT,
    });

    const view = await quoteTokenService.acceptPublicQuote(TOKEN);

    expect(view.state).toBe("ACCEPTED");
    expect(jobService.acceptQuote).not.toHaveBeenCalled();
  });

  it("rejects acceptance after decline", async () => {
    quoteTokenRepository.findByTokenHash.mockResolvedValue({
      ...activeToken,
      response: "DECLINED",
      responded_at: new Date().toISOString(),
    });
    jobRepository.getLeadById.mockResolvedValue({
      ...quotedLead,
      status: JOB_STATUS.LOST,
    });

    await expect(quoteTokenService.acceptPublicQuote(TOKEN)).rejects.toMatchObject({
      statusCode: 409,
      code: ERROR_CODES.INVALID_STATUS_TRANSITION,
    });
  });
});

describe("declinePublicQuote", () => {
  it("declines a quoted lead and records the reason", async () => {
    quoteTokenRepository.findByTokenHash.mockResolvedValue(activeToken);
    jobRepository.getLeadById
      .mockResolvedValueOnce(quotedLead)
      .mockResolvedValueOnce({
        ...quotedLead,
        status: JOB_STATUS.LOST,
      });
    jobService.markLeadAsLost.mockResolvedValue({
      ...quotedLead,
      status: JOB_STATUS.LOST,
    });
    quoteTokenRepository.markResponded.mockResolvedValue({
      ...activeToken,
      response: "DECLINED",
      responded_at: new Date().toISOString(),
      decline_reason: "Too expensive",
    });

    const view = await quoteTokenService.declinePublicQuote(
      TOKEN,
      "Too expensive",
    );

    expect(jobService.markLeadAsLost).toHaveBeenCalledWith(JOB_ID, {
      reason: "Customer declined quotation: Too expensive",
    });
    expect(quoteTokenRepository.markResponded).toHaveBeenCalledWith(
      "tok-1",
      "DECLINED",
      "Too expensive",
    );
    expect(view.state).toBe("DECLINED");
  });

  it("is idempotent when already declined", async () => {
    quoteTokenRepository.findByTokenHash.mockResolvedValue({
      ...activeToken,
      response: "DECLINED",
      responded_at: new Date().toISOString(),
    });
    jobRepository.getLeadById.mockResolvedValue({
      ...quotedLead,
      status: JOB_STATUS.LOST,
    });

    const view = await quoteTokenService.declinePublicQuote(TOKEN);
    expect(view.state).toBe("DECLINED");
    expect(jobService.markLeadAsLost).not.toHaveBeenCalled();
  });

  it("rejects decline after acceptance", async () => {
    quoteTokenRepository.findByTokenHash.mockResolvedValue({
      ...activeToken,
      response: "ACCEPTED",
      responded_at: new Date().toISOString(),
    });
    jobRepository.getLeadById.mockResolvedValue({
      ...quotedLead,
      status: JOB_STATUS.AWAITING_DEPOSIT,
    });

    await expect(
      quoteTokenService.declinePublicQuote(TOKEN),
    ).rejects.toMatchObject({
      statusCode: 409,
    });
  });
});

describe("splitInclusiveVat", () => {
  it("splits a VAT-inclusive total at 20%", () => {
    const result = quoteTokenService.splitInclusiveVat(120);
    expect(result.gross).toBe(120);
    expect(result.net).toBe(100);
    expect(result.vat).toBe(20);
  });
});
