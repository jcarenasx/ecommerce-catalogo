import { api } from "../lib/api";

export type CustomerRecord = {
  id: string;
  name: string;
  phone: string;
  createdAt: string;
};

export type CustomerPayload = {
  name: string;
  phone: string;
};

export async function fetchCustomers(): Promise<CustomerRecord[]> {
  const response = await api.get<{ customers: CustomerRecord[] }>("/customers");
  return response.data.customers;
}

export async function createCustomer(payload: CustomerPayload): Promise<void> {
  await api.post("/customers", payload);
}
