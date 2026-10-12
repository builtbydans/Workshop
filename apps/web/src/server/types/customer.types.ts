export interface CreateCustomerDto {
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
}

export interface UpdateCustomerDto {
  first_name?: string;
  last_name?: string;
  phone?: string;
  email?: string;
}
