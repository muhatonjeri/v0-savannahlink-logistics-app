"use client";

import type { Booking, AdminUser, MpesaPayment, Client } from "@/types";

const BOOKINGS_KEY = "savannah_link_bookings";
const USERS_KEY = "savannah_link_users";
const PAYMENTS_KEY = "savannah_link_payments";
const CLIENTS_KEY = "savannah_link_clients";

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

// Clients Store (for returning clients)
export function getClients(): Client[] {
  return getStorage<Client[]>(CLIENTS_KEY, []);
}

export function getClientById(id: string): Client | undefined {
  const clients = getClients();
  return clients.find((c) => c.id === id);
}

export function searchClients(query: string): Client[] {
  const clients = getClients();
  const lowerQuery = query.toLowerCase();
  return clients.filter(
    (c) =>
      c.fullName.toLowerCase().includes(lowerQuery) ||
      c.phone.includes(query) ||
      c.idNumber.toLowerCase().includes(lowerQuery) ||
      c.email.toLowerCase().includes(lowerQuery)
  );
}

export function getClientByIdNumber(idNumber: string): Client | undefined {
  const clients = getClients();
  return clients.find((c) => c.idNumber.toLowerCase() === idNumber.toLowerCase());
}

export function getClientByPhone(phone: string): Client | undefined {
  const clients = getClients();
  // Normalize phone number for comparison
  const normalizedPhone = phone.replace(/\D/g, '');
  return clients.find((c) => c.phone.replace(/\D/g, '') === normalizedPhone);
}

export function saveClient(client: Client): Client {
  const clients = getClients();
  const existingIndex = clients.findIndex((c) => c.id === client.id);
  
  if (existingIndex >= 0) {
    clients[existingIndex] = { ...client, updatedAt: new Date().toISOString() };
  } else {
    clients.push(client);
  }
  
  setStorage(CLIENTS_KEY, clients);
  return client;
}

export function createClientFromBooking(booking: Booking): Client | null {
  // Only works for car rental bookings that have personal details
  if (booking.serviceType !== "car-rental") return null;
  
  const carRentalBooking = booking as import("@/types").CarRentalBooking;
  const pd = carRentalBooking.personalDetails;
  
  // Check if client already exists
  const existingClient = getClientByIdNumber(pd.idNumber);
  if (existingClient) {
    // Update booking count
    existingClient.totalBookings += 1;
    existingClient.updatedAt = new Date().toISOString();
    saveClient(existingClient);
    return existingClient;
  }
  
  // Create new client
  const newClient: Client = {
    id: generateId(),
    fullName: pd.fullName,
    idNumber: pd.idNumber,
    idPhotoUrl: pd.idPhotoUrl,
    drivingLicenseNumber: pd.drivingLicenseNumber,
    drivingLicenseUrl: pd.drivingLicenseUrl,
    placeOfWork: pd.placeOfWork,
    kraPin: pd.kraPin,
    residence: pd.residence,
    phone: pd.phone,
    alternativePhone: pd.alternativePhone,
    email: booking.customerEmail,
    nextOfKin: pd.nextOfKin,
    fingerprintLeftUrl: pd.fingerprintLeftUrl,
    fingerprintRightUrl: pd.fingerprintRightUrl,
    passportPhotoUrl: pd.passportPhotoUrl,
    totalBookings: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  saveClient(newClient);
  return newClient;
}

export function deleteClient(id: string): boolean {
  const clients = getClients();
  const filtered = clients.filter((c) => c.id !== id);
  
  if (filtered.length < clients.length) {
    setStorage(CLIENTS_KEY, filtered);
    return true;
  }
  return false;
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
