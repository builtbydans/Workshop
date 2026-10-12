export interface VehicleData {
  id: string;
  customer_id: string;
  registration: string;
  make: string;
  model: string;
}

export interface VehicleFormData {
  registration: string;
  make: string;
  model: string;
}

export interface CreateVehicleDto {
  customer_id: string;
  registration: string;
  make: string;
  model: string;
}

export interface UpdateVehicleDto {
  registration?: string;
  make?: string;
  model?: string;
}
