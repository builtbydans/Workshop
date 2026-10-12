import supabase from "../../config/db/supabase";
import { AppError } from "../../errors/AppError";

const getCustomers = async () => {
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .order("created_at", { ascending: false })
    .is("deleted_at", null);

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

const getCustomerById = async (id: string) => {
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

const findCustomerByEmail = async (email: string) => {
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

const findCustomerByPhone = async (phone: string) => {
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .eq("phone", phone)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

const createCustomer = async (customerData: Record<string, unknown>) => {
  const { data, error } = await supabase
    .from("customers")
    .insert([customerData])
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      const duplicateError = new AppError(
        "A customer with this email or phone number already exists.",
        400,
      );

      throw duplicateError;
    }

    throw new AppError(error.message, 500);
  }

  return data;
};

const updateCustomerById = async (
  id: string,
  updatedData: Record<string, unknown>,
) => {
  const { data, error } = await supabase
    .from("customers")
    .update(updatedData)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

const deleteCustomerById = async (id: string) => {
  const { data, error } = await supabase
    .from("customers")
    .update({
      deleted_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new AppError(error.message, 500);
  }

  return data;
};

export { findCustomerByEmail, findCustomerByPhone, createCustomer, getCustomers, getCustomerById, updateCustomerById, deleteCustomerById };
