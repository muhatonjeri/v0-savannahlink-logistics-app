"use client";

import { useState, useEffect } from "react";
import { Phone, Loader2, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field";
import {
  initiateStkPush,
  simulatePaymentCallback,
  validatePhoneNumber,
  formatCurrency,
} from "@/lib/mpesa";

type PaymentState = "idle" | "initiating" | "waiting" | "success" | "failed";

interface MpesaPaymentProps {
  bookingId: string;
  amount: number;
  onSuccess?: () => void;
  onFailure?: () => void;
  defaultPhone?: string;
}

export function MpesaPayment({
  bookingId,
  amount,
  onSuccess,
  onFailure,
  defaultPhone = "",
}: MpesaPaymentProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState(defaultPhone);
  const [paymentState, setPaymentState] = useState<PaymentState>("idle");
  const [message, setMessage] = useState("");
  const [checkoutRequestId, setCheckoutRequestId] = useState("");
  const [error, setError] = useState("");

  // Reset state when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setPaymentState("idle");
      setMessage("");
      setError("");
    }
  }, [isOpen]);

  const handleInitiatePayment = async () => {
    // Validate phone
    const { valid, formatted } = validatePhoneNumber(phoneNumber);
    if (!valid) {
      setError("Please enter a valid Kenyan phone number (e.g., 0712345678)");
      return;
    }

    setError("");
    setPaymentState("initiating");

    try {
      const response = await initiateStkPush({
        phoneNumber: formatted,
        amount,
        bookingId,
        accountReference: `SL-${bookingId.substring(0, 8)}`,
        transactionDesc: "Savannah Link Booking Payment",
      });

      if (response.success) {
        setCheckoutRequestId(response.checkoutRequestId);
        setMessage(response.customerMessage);
        setPaymentState("waiting");

        // Simulate user completing payment after a delay
        // In production, this would be handled by M-Pesa callback
        setTimeout(async () => {
          const result = await simulatePaymentCallback(response.checkoutRequestId, true);
          if (result.status === "completed") {
            setPaymentState("success");
            setMessage(result.message);
            onSuccess?.();
          } else {
            setPaymentState("failed");
            setMessage(result.message);
            onFailure?.();
          }
        }, 3000);
      } else {
        setPaymentState("failed");
        setMessage(response.customerMessage);
        onFailure?.();
      }
    } catch (err) {
      setPaymentState("failed");
      setMessage("An error occurred. Please try again.");
      onFailure?.();
    }
  };

  const handleSimulateFailure = async () => {
    if (checkoutRequestId) {
      const result = await simulatePaymentCallback(checkoutRequestId, false);
      setPaymentState("failed");
      setMessage(result.message);
      onFailure?.();
    }
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)} className="gap-2">
        <Phone className="h-4 w-4" />
        Pay with M-Pesa
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#00A550]/10">
                <Phone className="h-5 w-5 text-[#00A550]" />
              </div>
              M-Pesa Payment
            </DialogTitle>
            <DialogDescription>
              Pay {formatCurrency(amount)} using M-Pesa Lipa Na M-Pesa
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {paymentState === "idle" && (
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="phone">Phone Number</FieldLabel>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="0712345678"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                  {error && (
                    <p className="mt-1 text-sm text-destructive">{error}</p>
                  )}
                  <p className="mt-1 text-xs text-muted-foreground">
                    Enter the M-Pesa registered phone number
                  </p>
                </Field>
              </FieldGroup>
            )}

            {paymentState === "initiating" && (
              <div className="flex flex-col items-center gap-4 py-8">
                <Loader2 className="h-12 w-12 animate-spin text-[#00A550]" />
                <p className="text-center text-muted-foreground">
                  Initiating payment request...
                </p>
              </div>
            )}

            {paymentState === "waiting" && (
              <div className="flex flex-col items-center gap-4 py-8">
                <div className="relative">
                  <div className="h-16 w-16 animate-pulse rounded-full bg-[#00A550]/20" />
                  <Phone className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 text-[#00A550]" />
                </div>
                <div className="text-center">
                  <p className="font-medium text-foreground">Check your phone</p>
                  <p className="mt-1 text-sm text-muted-foreground">{message}</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Waiting for payment confirmation...
                </div>
                {/* Demo: Button to simulate failure */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-muted-foreground"
                  onClick={handleSimulateFailure}
                >
                  (Demo: Simulate Cancel)
                </Button>
              </div>
            )}

            {paymentState === "success" && (
              <div className="flex flex-col items-center gap-4 py-8">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/20">
                  <CheckCircle2 className="h-8 w-8 text-success" />
                </div>
                <div className="text-center">
                  <p className="font-medium text-foreground">Payment Successful!</p>
                  <p className="mt-1 text-sm text-muted-foreground">{message}</p>
                </div>
                <Button onClick={() => setIsOpen(false)} className="mt-2">
                  Done
                </Button>
              </div>
            )}

            {paymentState === "failed" && (
              <div className="flex flex-col items-center gap-4 py-8">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/20">
                  <XCircle className="h-8 w-8 text-destructive" />
                </div>
                <div className="text-center">
                  <p className="font-medium text-foreground">Payment Failed</p>
                  <p className="mt-1 text-sm text-muted-foreground">{message}</p>
                </div>
                <Button
                  onClick={() => setPaymentState("idle")}
                  variant="outline"
                  className="mt-2"
                >
                  Try Again
                </Button>
              </div>
            )}
          </div>

          {paymentState === "idle" && (
            <div className="flex flex-col gap-3">
              <Button onClick={handleInitiatePayment} className="w-full gap-2 bg-[#00A550] hover:bg-[#008C44]">
                <Phone className="h-4 w-4" />
                Send Payment Request
              </Button>
              <div className="flex items-start gap-2 rounded-lg bg-muted/50 p-3">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">
                  This is a demo/sandbox environment. No actual payment will be processed. 
                  In production, this would connect to Safaricom&apos;s Daraja API.
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
