"use client";

import { generateId, savePayment, updateBookingPaymentStatus } from "./store";
import type { MpesaPayment, PaymentStatus } from "@/types";

// Mock M-Pesa Daraja API Client
// In production, this would connect to the real Safaricom Daraja API

export interface STKPushRequest {
  phoneNumber: string;
  amount: number;
  bookingId: string;
  accountReference: string;
  transactionDesc: string;
}

export interface STKPushResponse {
  success: boolean;
  merchantRequestId: string;
  checkoutRequestId: string;
  responseCode: string;
  responseDescription: string;
  customerMessage: string;
}

// Validate Kenyan phone number format
export function validatePhoneNumber(phone: string): { valid: boolean; formatted: string } {
  // Remove any spaces, dashes, or special characters
  let cleaned = phone.replace(/[\s\-\(\)]/g, "");
  
  // Handle different formats
  if (cleaned.startsWith("+254")) {
    cleaned = cleaned.substring(1); // Remove +
  } else if (cleaned.startsWith("0")) {
    cleaned = "254" + cleaned.substring(1); // Convert 07xx to 2547xx
  } else if (cleaned.startsWith("7")) {
    cleaned = "254" + cleaned; // Add country code
  }
  
  // Validate: must be 12 digits starting with 254
  const isValid = /^254[17]\d{8}$/.test(cleaned);
  
  return {
    valid: isValid,
    formatted: cleaned,
  };
}

// Format amount for display
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 0,
  }).format(amount);
}

// Mock STK Push - simulates sending payment request to user's phone
export async function initiateStkPush(request: STKPushRequest): Promise<STKPushResponse> {
  const { phoneNumber, amount, bookingId, accountReference, transactionDesc } = request;
  
  // Validate phone number
  const { valid, formatted } = validatePhoneNumber(phoneNumber);
  if (!valid) {
    return {
      success: false,
      merchantRequestId: "",
      checkoutRequestId: "",
      responseCode: "1",
      responseDescription: "Invalid phone number format",
      customerMessage: "Please enter a valid Kenyan phone number",
    };
  }
  
  // Validate amount
  if (amount < 1) {
    return {
      success: false,
      merchantRequestId: "",
      checkoutRequestId: "",
      responseCode: "2",
      responseDescription: "Invalid amount",
      customerMessage: "Amount must be at least KES 1",
    };
  }
  
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1500));
  
  // Generate mock request IDs
  const merchantRequestId = `MRQ-${generateId()}`;
  const checkoutRequestId = `CHK-${generateId()}`;
  
  // Create payment record
  const payment: MpesaPayment = {
    id: generateId(),
    bookingId,
    phoneNumber: formatted,
    amount,
    merchantRequestId,
    checkoutRequestId,
    responseCode: "0",
    responseDescription: "Success. Request accepted for processing",
    customerMessage: `Please complete the M-Pesa payment of ${formatCurrency(amount)} on your phone`,
    status: "processing",
    createdAt: new Date().toISOString(),
  };
  
  // Save payment record
  savePayment(payment);
  
  // Update booking payment status
  updateBookingPaymentStatus(bookingId, "processing");
  
  return {
    success: true,
    merchantRequestId,
    checkoutRequestId,
    responseCode: "0",
    responseDescription: "Success. Request accepted for processing",
    customerMessage: payment.customerMessage,
  };
}

// Mock payment callback - simulates user completing payment
export async function simulatePaymentCallback(
  checkoutRequestId: string,
  success: boolean = true
): Promise<{ status: PaymentStatus; message: string }> {
  // Simulate delay (user entering PIN, etc.)
  await new Promise((resolve) => setTimeout(resolve, 2000));
  
  // Find the payment by checkoutRequestId
  const payments = JSON.parse(localStorage.getItem("savannah_link_payments") || "[]") as MpesaPayment[];
  const payment = payments.find((p) => p.checkoutRequestId === checkoutRequestId);
  
  if (!payment) {
    return {
      status: "failed",
      message: "Payment not found",
    };
  }
  
  // Update payment status
  const newStatus: PaymentStatus = success ? "completed" : "failed";
  payment.status = newStatus;
  payment.completedAt = new Date().toISOString();
  
  // Save updated payment
  savePayment(payment);
  
  // Update booking payment status
  updateBookingPaymentStatus(payment.bookingId, newStatus);
  
  return {
    status: newStatus,
    message: success
      ? `Payment of ${formatCurrency(payment.amount)} received successfully`
      : "Payment was cancelled or failed",
  };
}

// Check payment status
export function checkPaymentStatus(checkoutRequestId: string): MpesaPayment | undefined {
  const payments = JSON.parse(localStorage.getItem("savannah_link_payments") || "[]") as MpesaPayment[];
  return payments.find((p) => p.checkoutRequestId === checkoutRequestId);
}
