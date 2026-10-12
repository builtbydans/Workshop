import { beforeEach, describe, expect, it, vi } from "vitest";

import { ERROR_CODES } from "../../errors/AppError";

const customerRepository = {
  getCustomers: vi.fn(),
  getCustomerById: vi.fn(),
  findCustomerByEmail: vi.fn(),
  findCustomerByPhone: vi.fn(),
  createCustomer: vi.fn(),
  updateCustomerById: vi.fn(),
  deleteCustomerById: vi.fn(),
};

const auditRepository = {
  createAuditLog: vi.fn(),
};

vi.mock("./customer.repository", () => customerRepository);
vi.mock("../audit/audit.repository", () => auditRepository);

const customerService = await import("./customer.service");

const existingCustomer = {
  id: "cust-1",
  first_name: "Alex",
  last_name: "Smith",
  email: "alex@example.com",
  phone: "07123456789",
};

beforeEach(() => {
  vi.clearAllMocks();
  auditRepository.createAuditLog.mockResolvedValue(null);
});

describe("createCustomer", () => {
  it("trims names and lowercases email before saving", async () => {
    customerRepository.findCustomerByEmail.mockResolvedValue(null);
    customerRepository.createCustomer.mockResolvedValue(existingCustomer);

    await customerService.createCustomer({
      first_name: "  Alex  ",
      last_name: "  Smith  ",
      phone: " 07123456789 ",
      email: "  ALEX@Example.COM ",
    });

    expect(customerRepository.createCustomer).toHaveBeenCalledWith({
      first_name: "Alex",
      last_name: "Smith",
      phone: "07123456789",
      email: "alex@example.com",
    });
    expect(auditRepository.createAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({ action: "CREATE", entity_type: "customer" }),
    );
  });

  it("rejects duplicate email addresses", async () => {
    customerRepository.findCustomerByEmail.mockResolvedValue(existingCustomer);

    await expect(
      customerService.createCustomer({
        first_name: "Jamie",
        last_name: "Lee",
        phone: "07987654321",
        email: "alex@example.com",
      }),
    ).rejects.toMatchObject({
      statusCode: 400,
      message: "Email already in use",
    });

    expect(customerRepository.createCustomer).not.toHaveBeenCalled();
  });

  it("requires first and last name", async () => {
    await expect(
      customerService.createCustomer({
        first_name: "   ",
        last_name: "Smith",
        phone: "07123456789",
        email: "new@example.com",
      }),
    ).rejects.toMatchObject({
      statusCode: 400,
      message: "First name and last name required",
    });
  });
});

describe("getCustomerById", () => {
  it("returns the customer when found", async () => {
    customerRepository.getCustomerById.mockResolvedValue(existingCustomer);

    const customer = await customerService.getCustomerById("cust-1");

    expect(customer).toEqual(existingCustomer);
  });

  it("throws 404 when the customer does not exist", async () => {
    customerRepository.getCustomerById.mockResolvedValue(null);

    await expect(
      customerService.getCustomerById("missing"),
    ).rejects.toMatchObject({
      statusCode: 404,
      message: "Customer not found",
    });
  });
});

describe("updateCustomerById", () => {
  it("rejects an empty update", async () => {
    await expect(
      customerService.updateCustomerById("cust-1", {}),
    ).rejects.toMatchObject({
      statusCode: 400,
      message: "No update provided",
    });
  });

  it("rejects an email already used by another customer", async () => {
    customerRepository.getCustomerById.mockResolvedValue(existingCustomer);
    customerRepository.findCustomerByEmail.mockResolvedValue({
      id: "cust-2",
      email: "taken@example.com",
    });

    await expect(
      customerService.updateCustomerById("cust-1", {
        email: "taken@example.com",
      }),
    ).rejects.toMatchObject({
      statusCode: 400,
      message: "Email already in use",
    });
  });

  it("allows a customer to keep their own email", async () => {
    customerRepository.getCustomerById.mockResolvedValue(existingCustomer);
    customerRepository.findCustomerByEmail.mockResolvedValue(existingCustomer);
    customerRepository.updateCustomerById.mockResolvedValue(existingCustomer);

    await customerService.updateCustomerById("cust-1", {
      email: "alex@example.com",
    });

    expect(customerRepository.updateCustomerById).toHaveBeenCalled();
  });
});

describe("deleteCustomerById", () => {
  it("writes an audit log when deletion succeeds", async () => {
    customerRepository.getCustomerById.mockResolvedValue(existingCustomer);
    customerRepository.deleteCustomerById.mockResolvedValue(existingCustomer);

    await customerService.deleteCustomerById("cust-1");

    expect(auditRepository.createAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "DELETE",
        entity_id: "cust-1",
      }),
    );
  });

  it("throws 404 when the customer does not exist", async () => {
    customerRepository.getCustomerById.mockResolvedValue(null);

    await expect(
      customerService.deleteCustomerById("missing"),
    ).rejects.toMatchObject({
      statusCode: 404,
      code: ERROR_CODES.NOT_FOUND,
    });
  });
});
