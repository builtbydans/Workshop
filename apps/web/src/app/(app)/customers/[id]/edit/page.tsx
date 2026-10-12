import EditCustomerForm from "@/components/customers/EditCustomerForm";
import { getCustomerById } from "@/services/customer.service.server";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditCustomerPage({ params }: Props) {
  const { id } = await params;
  const customer = await getCustomerById(id);

  if (!customer) {
    return <div>Customer not found</div>;
  }

  return (
    <div>
      <h1>
        Edit Customer: {customer.first_name} {customer.last_name}
      </h1>
      <EditCustomerForm customer={customer} />
    </div>
  );
}
