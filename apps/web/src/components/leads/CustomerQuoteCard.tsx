"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api-error";
import { Button } from "@/components/ui/button";
import {
  acceptQuote,
  markLeadAsLost,
  confirmDeposit,
} from "@/services/lead.service";
import { formatRegistration } from "@/utils/formatRegistration";
import { LeadSummaryDto } from "@/types/lead.types";

interface CustomerQuoteCardProps {
  job: LeadSummaryDto;
}

const CustomerQuoteCard = ({ job }: CustomerQuoteCardProps) => {
  const router = useRouter();

  const [reject, setReject] = useState(false);

  const handleAccept = async () => {
    try {
      await acceptQuote(job.id);
      router.refresh();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to accept quote"));
    }
  };

  const handleReject = async () => {
    try {
      await markLeadAsLost(job.id);
      setReject(true);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to reject quote"));
    }
  };

  const handleDepositPayment = async () => {
    try {
      await confirmDeposit(job.id);
      router.refresh();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to confirm deposit"));
    }
  };

  const depositAmount = (Number(job.quoted_cost ?? 0) * 0.1).toFixed(2);

  return (
    <div>
      <h1>This is the Customer View</h1>

      <div className="mt-6 rounded-lg border p-6">
        <h1 className="text-3xl font-bold">
          New Quote for {formatRegistration(job.vehicles.registration)}
        </h1>

        {job.status === "QUOTED" && (
          <div className="mt-4 space-y-2">
            <p>
              Hi {job.vehicles.customers.first_name}{" "}
              {job.vehicles.customers.last_name}
            </p>

            <p>A new quote has been generated for your recent enquiry.</p>

            <p>Job Type: {job.job_type}</p>

            <p>Quoted Cost: £{job.quoted_cost}</p>

            <p>Estimated Time To Complete: 2 Working Days</p>

            {!reject && (
              <div className="flex gap-1.5">
                <Button onClick={handleAccept} variant="outline">
                  Accept Quote
                </Button>

                <Button onClick={handleReject} variant="destructive">
                  Reject Quote
                </Button>
              </div>
            )}
          </div>
        )}

        {job.status === "AWAITING_DEPOSIT" && (
          <div className="mt-6 rounded-lg border p-6">
            <h2 className="text-xl font-bold">Quote Accepted</h2>

            <p className="mt-2">
              To secure your booking we require a 10% deposit.
            </p>

            <p className="mt-4 text-3xl font-bold">£{depositAmount}</p>

            <p className="mt-2 text-sm text-slate-500">
              This deposit will be deducted from your final invoice.
            </p>

            <Button className="mt-4" onClick={handleDepositPayment}>
              Mock Pay Deposit
            </Button>
          </div>
        )}

        {job.status === "BOOKED" && (
          <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-6">
            <h2 className="text-xl font-bold text-green-700">
              Booking Confirmed
            </h2>

            <p className="mt-3 text-black">
              Thank you for your deposit payment.
            </p>

            <p className="mt-2 text-black">
              Your booking has now been confirmed and your vehicle has been
              added to our workshop queue.
            </p>

            <p className="mt-2 text-black">
              A member of our team will contact you shortly to arrange a
              suitable drop-off date and time.
            </p>

            <p className="mt-4 text-sm text-slate-600">
              Deposit paid: £{depositAmount}
            </p>
          </div>
        )}

        {reject && (
          <div>
            <p>
              We are sorry that you are not happy with your current quote. We
              run a very competitive business and all prices reflect industry
              standards.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerQuoteCard;
