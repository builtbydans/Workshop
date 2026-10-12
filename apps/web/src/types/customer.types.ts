export interface CreateCustomerDto {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
}

export interface CustomerData {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
}
