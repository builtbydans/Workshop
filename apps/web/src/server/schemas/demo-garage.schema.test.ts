import { describe, expect, it } from "vitest";

import { publicGarageEnquirySchema } from "./demo-garage.schema";

const valid = {
  first_name: "Sam",
  last_name: "Taylor",
  email: "Sam@Example.com",
  phone: "07111222333",
  registration: "AB12 CDE",
  make: "Ford",
  model: "Focus",
  message: "Brakes squealing",
};

describe("publicGarageEnquirySchema", () => {
  it("accepts a valid enquiry and normalises email", () => {
    const result = publicGarageEnquirySchema.safeParse(valid);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("sam@example.com");
    }
  });

  it("rejects empty required fields", () => {
    const result = publicGarageEnquirySchema.safeParse({
      ...valid,
      first_name: "",
    });

    expect(result.success).toBe(false);
  });

  it("rejects honeypot submissions", () => {
    const result = publicGarageEnquirySchema.safeParse({
      ...valid,
      company_website: "https://spam.example",
    });

    expect(result.success).toBe(false);
  });

  it("rejects oversized messages", () => {
    const result = publicGarageEnquirySchema.safeParse({
      ...valid,
      message: "x".repeat(2001),
    });

    expect(result.success).toBe(false);
  });
});
