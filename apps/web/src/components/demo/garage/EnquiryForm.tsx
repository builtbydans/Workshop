"use client";

import { useState } from "react";
import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";

import { ApiError } from "@/lib/api-error";
import type { CreateLeadDto } from "@/types/lead.types";

type FieldErrors = Partial<Record<keyof CreateLeadDto | "form", string>>;

type EnquirySuccess = {
  id: string;
  job_number: string | null;
  status: string;
};

const EMPTY_FORM: CreateLeadDto = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  registration: "",
  make: "",
  model: "",
  message: "",
};

function validateClient(form: CreateLeadDto): FieldErrors {
  const errors: FieldErrors = {};

  if (!form.first_name.trim()) errors.first_name = "First name is required";
  if (!form.last_name.trim()) errors.last_name = "Last name is required";
  if (!form.email.trim()) {
    errors.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = "Enter a valid email address";
  }
  if (!form.phone.trim()) errors.phone = "Phone number is required";
  if (!form.registration.trim()) {
    errors.registration = "Vehicle registration is required";
  }
  if (!form.make.trim()) errors.make = "Vehicle make is required";
  if (!form.model.trim()) errors.model = "Vehicle model is required";
  if (!form.message.trim()) {
    errors.message = "Please describe the problem or enquiry";
  } else if (form.message.trim().length > 2000) {
    errors.message = "Message must be 2000 characters or fewer";
  }

  return errors;
}

export function EnquiryForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<CreateLeadDto>(EMPTY_FORM);
  const [honeypot, setHoneypot] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => {
      if (!(name in prev)) return prev;
      const next = { ...prev };
      delete next[name as keyof CreateLeadDto];
      return next;
    });
    setSubmitError(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError(null);

    const clientErrors = validateClient(formData);
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await fetch("/api/demo/garage/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          company_website: honeypot,
        }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok || !payload?.success) {
        const details = payload?.details as
          | Record<string, string[]>
          | undefined;

        if (details) {
          const fieldErrors: FieldErrors = {};
          for (const [key, messages] of Object.entries(details)) {
            if (key === "company_website") continue;
            if (key in EMPTY_FORM && messages[0]) {
              fieldErrors[key as keyof CreateLeadDto] = messages[0];
            }
          }
          if (Object.keys(fieldErrors).length > 0) {
            setErrors(fieldErrors);
          }
        }

        throw new ApiError(
          payload?.message || "Unable to send your enquiry",
          response.status,
          payload?.code || "INTERNAL_SERVER_ERROR",
          details,
        );
      }

      const data = payload.data as EnquirySuccess;
      const params = new URLSearchParams();
      if (data.job_number) params.set("ref", data.job_number);
      if (data.id) params.set("id", data.id);

      router.push(`/demo/garage/confirmation?${params.toString()}`);
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "Something went wrong. Please try again.";
      setSubmitError(message);
    } finally {
      setLoading(false);
    }
  };

  const fieldClass = (name: keyof CreateLeadDto) =>
    [
      "w-full rounded-md border bg-[color-mix(in_srgb,var(--garage-navy)_70%,transparent)] px-3 py-2.5 text-sm text-[var(--garage-ink)] outline-none transition",
      "placeholder:text-[var(--garage-ink-muted)]",
      "focus-visible:border-[var(--garage-accent)] focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--garage-accent)_35%,transparent)]",
      errors[name]
        ? "border-[var(--garage-danger)]"
        : "border-[var(--garage-line)]",
    ].join(" ");

  const a11y = (name: keyof CreateLeadDto) =>
    errors[name]
      ? ({
          "aria-invalid": true as const,
          "aria-describedby": `${name}-error`,
        } as const)
      : {};

  return (
    <form
      className="space-y-5"
      noValidate
      onSubmit={handleSubmit}
      aria-describedby={submitError ? "enquiry-form-error" : undefined}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          error={errors.first_name}
          id="first_name"
          label="First name"
          required
        >
          <input
            autoComplete="given-name"
            className={fieldClass("first_name")}
            id="first_name"
            name="first_name"
            onChange={handleChange}
            value={formData.first_name}
            {...a11y("first_name")}
          />
        </Field>
        <Field
          error={errors.last_name}
          id="last_name"
          label="Last name"
          required
        >
          <input
            autoComplete="family-name"
            className={fieldClass("last_name")}
            id="last_name"
            name="last_name"
            onChange={handleChange}
            value={formData.last_name}
            {...a11y("last_name")}
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field error={errors.email} id="email" label="Email" required>
          <input
            autoComplete="email"
            className={fieldClass("email")}
            id="email"
            name="email"
            onChange={handleChange}
            type="email"
            value={formData.email}
            {...a11y("email")}
          />
        </Field>
        <Field error={errors.phone} id="phone" label="Phone number" required>
          <input
            autoComplete="tel"
            className={fieldClass("phone")}
            id="phone"
            name="phone"
            onChange={handleChange}
            type="tel"
            value={formData.phone}
            {...a11y("phone")}
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field
          error={errors.registration}
          id="registration"
          label="Registration"
          required
        >
          <input
            autoComplete="off"
            className={fieldClass("registration")}
            id="registration"
            name="registration"
            onChange={handleChange}
            placeholder="e.g. MX21 ABC"
            value={formData.registration}
            {...a11y("registration")}
          />
        </Field>
        <Field error={errors.make} id="make" label="Make" required>
          <input
            autoComplete="off"
            className={fieldClass("make")}
            id="make"
            name="make"
            onChange={handleChange}
            placeholder="Ford"
            value={formData.make}
            {...a11y("make")}
          />
        </Field>
        <Field error={errors.model} id="model" label="Model" required>
          <input
            autoComplete="off"
            className={fieldClass("model")}
            id="model"
            name="model"
            onChange={handleChange}
            placeholder="Focus"
            value={formData.model}
            {...a11y("model")}
          />
        </Field>
      </div>

      <Field
        error={errors.message}
        id="message"
        label="Problem description / enquiry"
        required
      >
        <textarea
          className={`${fieldClass("message")} min-h-32 resize-y`}
          id="message"
          name="message"
          onChange={handleChange}
          placeholder="Tell us what’s wrong with the vehicle, when you noticed it, and any urgency…"
          rows={5}
          value={formData.message}
          {...a11y("message")}
        />
      </Field>

      {/* Honeypot — hidden from users/AT, present in the DOM for naive bots */}
      <div className="hidden" hidden>
        <label htmlFor="company_website">Company website</label>
        <input
          autoComplete="off"
          id="company_website"
          name="company_website"
          onChange={(e) => setHoneypot(e.target.value)}
          tabIndex={-1}
          type="text"
          value={honeypot}
        />
      </div>

      {submitError ? (
        <p
          className="rounded-md border border-[color-mix(in_srgb,var(--garage-danger)_45%,transparent)] bg-[color-mix(in_srgb,var(--garage-danger)_12%,transparent)] px-3 py-2 text-sm text-[var(--garage-ink)]"
          id="enquiry-form-error"
          role="alert"
        >
          {submitError}
        </p>
      ) : null}

      <button
        className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-[var(--garage-accent)] px-4 py-3 text-sm font-semibold tracking-wide text-white transition hover:bg-[var(--garage-accent-hover)] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        disabled={loading}
        type="submit"
      >
        {loading ? <LoaderCircle className="size-4 animate-spin" aria-hidden /> : null}
        {loading ? "Sending enquiry…" : "Request a quotation"}
      </button>
    </form>
  );
}

function Field({
  id,
  label,
  required,
  error,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  const errorId = `${id}-error`;

  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-[var(--garage-ink)]" htmlFor={id}>
        {label}
        {required ? (
          <span className="text-[var(--garage-accent)]" aria-hidden>
            {" "}
            *
          </span>
        ) : null}
      </label>
      {children}
      {error ? (
        <p className="text-sm text-[var(--garage-danger)]" id={errorId} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
