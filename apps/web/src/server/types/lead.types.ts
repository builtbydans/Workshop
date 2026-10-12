export interface CreateLeadDto {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;

  registration: string;
  make: string;
  model: string;

  message: string;
}

export interface QuoteLeadDto {
  job_type: string;
  quoted_cost: number;
}
