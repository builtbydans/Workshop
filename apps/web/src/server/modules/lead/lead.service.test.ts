import { beforeEach, describe, expect, it, vi } from "vitest";

const customerService = {
  findCustomerByEmail: vi.fn(),
  createCustomer: vi.fn(),
};

const vehicleService = {
  findVehicleByRegistration: vi.fn(),
  createVehicle: vi.fn(),
};

const jobService = {
  getLeads: vi.fn(),
  getLeadById: vi.fn(),
  quoteLead: vi.fn(),
  markLeadAsLost: vi.fn(),
  acceptQuote: vi.fn(),
  createJob: vi.fn(),
};

vi.mock("../customer/customer.service", () => customerService);
vi.mock("../vehicle/vehicle.service", () => vehicleService);
vi.mock("../job/job.service", () => jobService);

const leadService = await import("./lead.service");

const baseLead = {
  first_name: "Sam",
  last_name: "Taylor",
  email: "sam@example.com",
  phone: "07111222333",
  registration: "AB12 CDE",
  make: "Ford",
  model: "Focus",
  message: "Brakes squealing on cold mornings",
};

const customer = {
  id: "cust-1",
  first_name: "Sam",
  last_name: "Taylor",
  email: "sam@example.com",
  phone: "07111222333",
};

const vehicle = {
  id: "veh-1",
  customer_id: "cust-1",
  registration: "AB12CDE",
  make: "FORD",
  model: "FOCUS",
};

const job = {
  id: "job-1",
  job_number: "JOB-000042",
  vehicle_id: "veh-1",
  status: "LEAD",
  description: "Brakes squealing on cold mornings",
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("createLead", () => {
  it("creates customer, vehicle, and job for a new enquiry", async () => {
    customerService.findCustomerByEmail.mockResolvedValue(null);
    customerService.createCustomer.mockResolvedValue(customer);
    vehicleService.findVehicleByRegistration.mockResolvedValue(null);
    vehicleService.createVehicle.mockResolvedValue(vehicle);
    jobService.createJob.mockResolvedValue(job);

    const result = await leadService.createLead(baseLead);

    expect(customerService.createCustomer).toHaveBeenCalledWith({
      first_name: "Sam",
      last_name: "Taylor",
      email: "sam@example.com",
      phone: "07111222333",
    });
    expect(vehicleService.createVehicle).toHaveBeenCalledWith({
      customer_id: "cust-1",
      registration: "AB12 CDE",
      make: "Ford",
      model: "Focus",
    });
    expect(jobService.createJob).toHaveBeenCalledWith({
      vehicle_id: "veh-1",
      description: "Brakes squealing on cold mornings",
    });
    expect(result).toEqual(job);
  });

  it("reuses an existing customer matched by email", async () => {
    customerService.findCustomerByEmail.mockResolvedValue(customer);
    vehicleService.findVehicleByRegistration.mockResolvedValue(null);
    vehicleService.createVehicle.mockResolvedValue(vehicle);
    jobService.createJob.mockResolvedValue(job);

    await leadService.createLead(baseLead);

    expect(customerService.createCustomer).not.toHaveBeenCalled();
    expect(vehicleService.createVehicle).toHaveBeenCalled();
    expect(jobService.createJob).toHaveBeenCalled();
  });

  it("reuses an existing vehicle owned by the same customer", async () => {
    customerService.findCustomerByEmail.mockResolvedValue(customer);
    vehicleService.findVehicleByRegistration.mockResolvedValue(vehicle);
    jobService.createJob.mockResolvedValue(job);

    await leadService.createLead(baseLead);

    expect(vehicleService.createVehicle).not.toHaveBeenCalled();
    expect(jobService.createJob).toHaveBeenCalledWith({
      vehicle_id: "veh-1",
      description: "Brakes squealing on cold mornings",
    });
  });

  it("rejects a registration owned by a different customer", async () => {
    customerService.findCustomerByEmail.mockResolvedValue(customer);
    vehicleService.findVehicleByRegistration.mockResolvedValue({
      ...vehicle,
      customer_id: "someone-else",
    });

    await expect(leadService.createLead(baseLead)).rejects.toMatchObject({
      statusCode: 400,
      message: "Vehicle already registered to another customer",
    });

    expect(jobService.createJob).not.toHaveBeenCalled();
  });

  it("rejects invalid email format", async () => {
    await expect(
      leadService.createLead({ ...baseLead, email: "not-an-email" }),
    ).rejects.toMatchObject({
      statusCode: 400,
      message: "Invalid email format",
    });
  });

  it("rejects missing required fields", async () => {
    await expect(
      leadService.createLead({ ...baseLead, message: "   " }),
    ).rejects.toMatchObject({
      statusCode: 400,
      message: "Message is required",
    });
  });

  it("surfaces database failures from job creation", async () => {
    customerService.findCustomerByEmail.mockResolvedValue(customer);
    vehicleService.findVehicleByRegistration.mockResolvedValue(vehicle);
    jobService.createJob.mockRejectedValue(new Error("database offline"));

    await expect(leadService.createLead(baseLead)).rejects.toThrow(
      "database offline",
    );
  });
});
