"use client";

import type { Booking, AdminUser, MpesaPayment } from "@/types";

const BOOKINGS_KEY = "savannah_link_bookings";
const USERS_KEY = "savannah_link_users";
const PAYMENTS_KEY = "savannah_link_payments";

// Initialize default admin users
const defaultUsers: AdminUser[] = [
  {
    id: "admin-1",
    name: "Admin User",
    email: "admin@savannahlink.co.ke",
    role: "admin",
    createdAt: new Date().toISOString(),
  },
  {
    id: "staff-1",
    name: "John Kamau",
    email: "john@savannahlink.co.ke",
    role: "staff",
    createdAt: new Date().toISOString(),
  },
  {
    id: "staff-2",
    name: "Mary Wanjiku",
    email: "mary@savannahlink.co.ke",
    role: "staff",
    createdAt: new Date().toISOString(),
  },
  {
    id: "staff-3",
    name: "Peter Ochieng",
    email: "peter@savannahlink.co.ke",
    role: "staff",
    createdAt: new Date().toISOString(),
  },
];

// Helper to safely access localStorage (only in browser)
function getStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error("Error saving to localStorage:", error);
  }
}

// Bookings Store
export function getBookings(): Booking[] {
  return getStorage<Booking[]>(BOOKINGS_KEY, []);
}

export function getBookingById(id: string): Booking | undefined {
  const bookings = getBookings();
  return bookings.find((b) => b.id === id);
}

export function getBookingsByService(serviceType: string): Booking[] {
  const bookings = getBookings();
  return bookings.filter((b) => b.serviceType === serviceType);
}

export function saveBooking(booking: Booking): Booking {
  const bookings = getBookings();
  const existingIndex = bookings.findIndex((b) => b.id === booking.id);
  
  if (existingIndex >= 0) {
    bookings[existingIndex] = { ...booking, updatedAt: new Date().toISOString() };
  } else {
    bookings.push(booking);
  }
  
  setStorage(BOOKINGS_KEY, bookings);
  return booking;
}

export function deleteBooking(id: string): boolean {
  const bookings = getBookings();
  const filtered = bookings.filter((b) => b.id !== id);
  
  if (filtered.length < bookings.length) {
    setStorage(BOOKINGS_KEY, filtered);
    return true;
  }
  return false;
}

export function updateBookingStatus(id: string, status: Booking["status"]): Booking | undefined {
  const bookings = getBookings();
  const booking = bookings.find((b) => b.id === id);
  
  if (booking) {
    booking.status = status;
    booking.updatedAt = new Date().toISOString();
    setStorage(BOOKINGS_KEY, bookings);
    return booking;
  }
  return undefined;
}

export function updateBookingPaymentStatus(id: string, paymentStatus: Booking["paymentStatus"]): Booking | undefined {
  const bookings = getBookings();
  const booking = bookings.find((b) => b.id === id);
  
  if (booking) {
    booking.paymentStatus = paymentStatus;
    booking.updatedAt = new Date().toISOString();
    setStorage(BOOKINGS_KEY, bookings);
    return booking;
  }
  return undefined;
}

// Users Store
export function getUsers(): AdminUser[] {
  const users = getStorage<AdminUser[]>(USERS_KEY, []);
  if (users.length === 0) {
    setStorage(USERS_KEY, defaultUsers);
    return defaultUsers;
  }
  return users;
}

export function getUserById(id: string): AdminUser | undefined {
  const users = getUsers();
  return users.find((u) => u.id === id);
}

export function saveUser(user: AdminUser): AdminUser {
  const users = getUsers();
  const existingIndex = users.findIndex((u) => u.id === user.id);
  
  if (existingIndex >= 0) {
    users[existingIndex] = user;
  } else {
    users.push(user);
  }
  
  setStorage(USERS_KEY, users);
  return user;
}

export function deleteUser(id: string): boolean {
  const users = getUsers();
  const filtered = users.filter((u) => u.id !== id);
  
  if (filtered.length < users.length) {
    setStorage(USERS_KEY, filtered);
    return true;
  }
  return false;
}

// Payments Store
export function getPayments(): MpesaPayment[] {
  return getStorage<MpesaPayment[]>(PAYMENTS_KEY, []);
}

export function getPaymentById(id: string): MpesaPayment | undefined {
  const payments = getPayments();
  return payments.find((p) => p.id === id);
}

export function getPaymentByBookingId(bookingId: string): MpesaPayment | undefined {
  const payments = getPayments();
  return payments.find((p) => p.bookingId === bookingId);
}

export function savePayment(payment: MpesaPayment): MpesaPayment {
  const payments = getPayments();
  const existingIndex = payments.findIndex((p) => p.id === payment.id);
  
  if (existingIndex >= 0) {
    payments[existingIndex] = payment;
  } else {
    payments.push(payment);
  }
  
  setStorage(PAYMENTS_KEY, payments);
  return payment;
}

// Generate unique ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// Get booking statistics
export function getBookingStats() {
  const bookings = getBookings();
  
  const stats = {
    total: bookings.length,
    pending: bookings.filter((b) => b.status === "pending").length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    inProgress: bookings.filter((b) => b.status === "in-progress").length,
    completed: bookings.filter((b) => b.status === "completed").length,
    cancelled: bookings.filter((b) => b.status === "cancelled").length,
    byService: {} as Record<string, number>,
    totalRevenue: 0,
    pendingPayments: 0,
  };
  
  bookings.forEach((booking) => {
    // Count by service
    stats.byService[booking.serviceType] = (stats.byService[booking.serviceType] || 0) + 1;
    
    // Calculate revenue
    if (booking.paymentStatus === "completed") {
      stats.totalRevenue += booking.totalAmount;
    } else if (booking.paymentStatus === "pending" || booking.paymentStatus === "processing") {
      stats.pendingPayments += booking.totalAmount;
    }
  });
  
  return stats;
}
