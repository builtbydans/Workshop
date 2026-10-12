import * as vehicleRepository from "./vehicle.repository";
import * as auditRepository from "../audit/audit.repository";
import { AppError } from "../../errors/AppError";
import { CreateVehicleDto, UpdateVehicleDto } from "../../types/vehicle.types";

const getVehicles = async () => {
  return vehicleRepository.getVehicles();
};

const getVehiclesByCustomerId = async (customerId: string) => {
  const vehicles = await vehicleRepository.getVehiclesByCustomerId(customerId);

  if (!vehicles) {
    throw new AppError("No vehicles found for this customer", 404);
  }

  return vehicles;
};

const createVehicle = async (vehicleData: CreateVehicleDto) => {
  let { customer_id, registration, make, model } = vehicleData;

  registration = registration?.trim().toUpperCase().replace(/\s+/g, "");
  make = make?.trim().toUpperCase();
  model = model?.trim().toUpperCase();

  if (!customer_id) {
    throw new AppError("Customer ID is required", 400);
  }

  if (!registration) {
    throw new AppError("Registration is required", 400);
  }

  if (!make) {
    throw new AppError("Make is required", 400);
  }

  if (!model) {
    throw new AppError("Model is required", 400);
  }

  const existingVehicle =
    await vehicleRepository.findVehicleByReg(registration);

  if (existingVehicle) {
    throw new AppError("Vehicle already registered", 400);
  }

  const vehicle = await vehicleRepository.createVehicle({
    customer_id,
    registration,
    make,
    model,
  });

  await auditRepository.createAuditLog({
    entity_type: "vehicle",
    entity_id: vehicle.id,
    action: "CREATE",
    old_value: null,
    new_value: vehicle,
  });

  return vehicle;
};

const updateVehicleById = async (id: string, updatedData: UpdateVehicleDto) => {
  if (!updatedData || Object.keys(updatedData).length === 0) {
    throw new AppError("No update provided", 400);
  }

  const vehicle = await vehicleRepository.getVehicleById(id);

  if (!vehicle) {
    throw new AppError("Vehicle not found", 404);
  }

  const sanitisedData = {
    ...updatedData,
  };

  if (sanitisedData.registration) {
    sanitisedData.registration = sanitisedData.registration
      .trim()
      .toUpperCase()
      .replace(/\s+/g, "");

    const existingVehicle = await vehicleRepository.findVehicleByReg(
      sanitisedData.registration,
    );

    if (existingVehicle && existingVehicle.id !== id) {
      throw new AppError("Vehicle already registered", 400);
    }
  }

  if (sanitisedData.make) {
    sanitisedData.make = sanitisedData.make.trim();
  }

  if (sanitisedData.model) {
    sanitisedData.model = sanitisedData.model.trim();
  }

  const updatedVehicle = await vehicleRepository.updateVehicleById(
    id,
    sanitisedData,
  );

  await auditRepository.createAuditLog({
    entity_type: "vehicle",
    entity_id: id,
    action: "UPDATE",
    old_value: vehicle,
    new_value: updatedVehicle,
  });

  return updatedVehicle;
};

const deleteVehicleById = async (id: string) => {
  const existingVehicle = await vehicleRepository.getVehicleById(id);

  if (!existingVehicle) {
    throw new AppError("Vehicle not found", 404);
  }

  const deletedVehicle = await vehicleRepository.deleteVehicleById(id);

  await auditRepository.createAuditLog({
    entity_type: "vehicle",
    entity_id: id,
    action: "DELETE",
    old_value: existingVehicle,
    new_value: deletedVehicle,
  });

  return deletedVehicle;
};

export { getVehicles, getVehiclesByCustomerId, createVehicle, updateVehicleById, deleteVehicleById };
