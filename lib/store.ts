"use client";

import type { Booking, AdminUser, MpesaPayment, Client, RogueClient } from "@/types";

const BOOKINGS_KEY = "savannah_link_bookings";
const USERS_KEY = "savannah_link_users";
const PAYMENTS_KEY = "savannah_link_payments";
const CLIENTS_KEY = "savannah_link_clients";
const ROGUE_CLIENTS_KEY = "savannah_link_rogue_clients";

// Demo clients for testing
const demoClients: Client[] = [
  {
    id: "client-demo-1",
    fullName: "James Mwangi Kariuki",
    idNumber: "12345678",
    phone: "+254712345678",
    alternativePhone: "+254722345678",
    email: "james.mwangi@gmail.com",
    residence: "Westlands, Nairobi",
    placeOfWork: "Safaricom PLC",
    kraPin: "A012345678B",
    drivingLicenseNumber: "DL-2020-123456",
    nextOfKin: {
      name: "Mary Wanjiku Kariuki",
      phone: "+254733456789",
      relationship: "Spouse",
    },
    totalBookings: 5,
    riskLevel: "low",
    createdAt: "2024-01-15T10:00:00.000Z",
    updatedAt: "2024-12-01T14:30:00.000Z",
  },
  {
    id: "client-demo-2",
    fullName: "Grace Akinyi Odhiambo",
    idNumber: "23456789",
    phone: "+254723456789",
    alternativePhone: "+254734567890",
    email: "grace.akinyi@yahoo.com",
    residence: "Kilimani, Nairobi",
    placeOfWork: "KCB Bank",
    kraPin: "B023456789C",
    drivingLicenseNumber: "DL-2019-234567",
    nextOfKin: {
      name: "Peter Odhiambo",
      phone: "+254745678901",
      relationship: "Brother",
    },
    totalBookings: 3,
    riskLevel: "medium",
    totalDebt: 15000,
    alerts: [
      {
        id: "alert-1",
        type: "debt",
        title: "Outstanding Balance",
        description: "Unpaid balance from rental on 15th Nov 2024. Client promised to pay by end of month.",
        amount: 15000,
        date: "2024-11-15T00:00:00.000Z",
        resolved: false,
      },
      {
        id: "alert-2",
        type: "late-return",
        title: "Late Return",
        description: "Returned vehicle 2 days late on previous rental without prior notice.",
        date: "2024-09-20T00:00:00.000Z",
        resolved: true,
        resolvedDate: "2024-09-22T00:00:00.000Z",
      },
    ],
    notes: "Has been a regular client but recently has payment issues. Follow up on outstanding balance.",
    createdAt: "2024-03-20T09:00:00.000Z",
    updatedAt: "2024-11-15T16:45:00.000Z",
  },
  {
    id: "client-demo-3",
    fullName: "David Kipchoge Korir",
    idNumber: "34567890",
    phone: "+254734567890",
    alternativePhone: "+254745678901",
    email: "david.kipchoge@outlook.com",
    residence: "Karen, Nairobi",
    placeOfWork: "Equity Bank",
    kraPin: "C034567890D",
    drivingLicenseNumber: "DL-2021-345678",
    nextOfKin: {
      name: "Faith Chebet Korir",
      phone: "+254756789012",
      relationship: "Wife",
    },
    totalBookings: 8,
    riskLevel: "high",
    totalDebt: 85000,
    alerts: [
      {
        id: "alert-3",
        type: "debt",
        title: "Large Outstanding Debt",
        description: "Accumulated debt from multiple rentals. Has not responded to payment requests.",
        amount: 85000,
        date: "2024-10-01T00:00:00.000Z",
        resolved: false,
      },
      {
        id: "alert-4",
        type: "damage",
        title: "Vehicle Damage",
        description: "Returned Toyota Prado with significant damage to front bumper and headlight. Repair cost KES 45,000.",
        amount: 45000,
        date: "2024-08-15T00:00:00.000Z",
        resolved: false,
      },
      {
        id: "alert-5",
        type: "warning",
        title: "Suspicious Behavior",
        description: "Attempted to extend rental period without authorization. Contacted next of kin.",
        date: "2024-07-20T00:00:00.000Z",
        resolved: true,
        resolvedDate: "2024-07-22T00:00:00.000Z",
      },
    ],
    notes: "HIGH RISK CLIENT - Requires manager approval before any new rental. Must clear outstanding debt first.",
    createdAt: "2023-06-10T11:00:00.000Z",
    updatedAt: "2024-12-10T10:20:00.000Z",
  },
  {
    id: "client-demo-4",
    fullName: "Susan Njeri Kamau",
    idNumber: "45678901",
    phone: "+254745678901",
    email: "susan.njeri@gmail.com",
    residence: "Lavington, Nairobi",
    placeOfWork: "Nation Media Group",
    kraPin: "D045678901E",
    drivingLicenseNumber: "DL-2022-456789",
    nextOfKin: {
      name: "John Kamau",
      phone: "+254767890123",
      relationship: "Father",
    },
    totalBookings: 2,
    riskLevel: "blocked",
    alerts: [
      {
        id: "alert-6",
        type: "blacklisted",
        title: "BLACKLISTED - DO NOT RENT",
        description: "Client involved in fraud. Provided fake documents and attempted to steal vehicle. Police report filed.",
        date: "2024-09-01T00:00:00.000Z",
        resolved: false,
      },
      {
        id: "alert-7",
        type: "fraud",
        title: "Document Fraud",
        description: "ID and driving license verified as fake. Real identity unknown.",
        date: "2024-09-01T00:00:00.000Z",
        resolved: false,
      },
    ],
    notes: "DO NOT RENT TO THIS PERSON UNDER ANY CIRCUMSTANCES. Alert management immediately if they appear.",
    createdAt: "2024-08-05T13:00:00.000Z",
    updatedAt: "2024-10-20T09:15:00.000Z",
  },
  {
    id: "client-demo-5",
    fullName: "Michael Otieno Wafula",
    idNumber: "56789012",
    phone: "+254756789012",
    alternativePhone: "+254778901234",
    email: "michael.otieno@company.co.ke",
    residence: "Runda, Nairobi",
    placeOfWork: "KPMG Kenya",
    kraPin: "E056789012F",
    drivingLicenseNumber: "DL-2018-567890",
    nextOfKin: {
      name: "Joyce Atieno Wafula",
      phone: "+254789012345",
      relationship: "Mother",
    },
    totalBookings: 12,
    riskLevel: "low",
    notes: "VIP client - Always pays on time. Eligible for discounts.",
    createdAt: "2022-11-25T08:00:00.000Z",
    updatedAt: "2024-12-05T17:00:00.000Z",
  },
];

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

// Get booking history for a specific client by ID number or phone
export function getClientBookingHistory(clientIdNumber: string): Booking[] {
  const bookings = getBookings();
  return bookings.filter((b) => 
    b.customerDetails?.idNumber === clientIdNumber ||
    b.customerDetails?.phone?.includes(clientIdNumber.slice(-9))
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

// Demo booking history for testing
const demoBookingHistory: Booking[] = [
  {
    id: "booking-hist-1",
    serviceType: "car-rental",
    customerDetails: {
      fullName: "James Mwangi Kariuki",
      email: "james.mwangi@gmail.com",
      phone: "+254712345678",
      idNumber: "12345678",
    },
    vehicleDetails: {
      make: "Toyota",
      model: "Land Cruiser V8",
      rentalType: "self-drive",
    },
    tripDetails: {
      pickupLocation: "JKIA Airport",
      dropoffLocation: "Nairobi CBD",
      pickupDate: "2024-01-20",
      pickupTime: "10:00",
      returnDate: "2024-01-25",
      returnTime: "18:00",
    },
    status: "completed",
    paymentStatus: "paid",
    totalAmount: 75000,
    createdAt: "2024-01-18T08:00:00.000Z",
    updatedAt: "2024-01-25T18:30:00.000Z",
  },
  {
    id: "booking-hist-2",
    serviceType: "car-rental",
    customerDetails: {
      fullName: "James Mwangi Kariuki",
      email: "james.mwangi@gmail.com",
      phone: "+254712345678",
      idNumber: "12345678",
    },
    vehicleDetails: {
      make: "Toyota",
      model: "Prado TX",
      rentalType: "chauffeur-driven",
    },
    tripDetails: {
      pickupLocation: "Westlands",
      dropoffLocation: "Maasai Mara",
      pickupDate: "2024-03-10",
      pickupTime: "06:00",
      returnDate: "2024-03-14",
      returnTime: "20:00",
    },
    status: "completed",
    paymentStatus: "paid",
    totalAmount: 120000,
    createdAt: "2024-03-05T14:00:00.000Z",
    updatedAt: "2024-03-14T21:00:00.000Z",
  },
  {
    id: "booking-hist-3",
    serviceType: "car-rental",
    customerDetails: {
      fullName: "James Mwangi Kariuki",
      email: "james.mwangi@gmail.com",
      phone: "+254712345678",
      idNumber: "12345678",
    },
    vehicleDetails: {
      make: "Mercedes-Benz",
      model: "E-Class",
      rentalType: "self-drive",
    },
    tripDetails: {
      pickupLocation: "Nairobi CBD",
      dropoffLocation: "Nairobi CBD",
      pickupDate: "2024-06-15",
      pickupTime: "09:00",
      returnDate: "2024-06-17",
      returnTime: "18:00",
    },
    status: "completed",
    paymentStatus: "paid",
    totalAmount: 45000,
    createdAt: "2024-06-12T10:00:00.000Z",
    updatedAt: "2024-06-17T19:00:00.000Z",
  },
  {
    id: "booking-hist-4",
    serviceType: "car-rental",
    customerDetails: {
      fullName: "James Mwangi Kariuki",
      email: "james.mwangi@gmail.com",
      phone: "+254712345678",
      idNumber: "12345678",
    },
    vehicleDetails: {
      make: "Nissan",
      model: "Patrol",
      rentalType: "self-drive",
    },
    tripDetails: {
      pickupLocation: "JKIA Airport",
      dropoffLocation: "Mombasa",
      pickupDate: "2024-09-01",
      pickupTime: "07:00",
      returnDate: "2024-09-07",
      returnTime: "19:00",
    },
    status: "completed",
    paymentStatus: "paid",
    totalAmount: 98000,
    createdAt: "2024-08-28T11:00:00.000Z",
    updatedAt: "2024-09-07T20:00:00.000Z",
  },
  {
    id: "booking-hist-5",
    serviceType: "car-rental",
    customerDetails: {
      fullName: "James Mwangi Kariuki",
      email: "james.mwangi@gmail.com",
      phone: "+254712345678",
      idNumber: "12345678",
    },
    vehicleDetails: {
      make: "Toyota",
      model: "Hilux Double Cab",
      rentalType: "self-drive",
    },
    tripDetails: {
      pickupLocation: "Westlands",
      dropoffLocation: "Nakuru",
      pickupDate: "2024-11-20",
      pickupTime: "08:00",
      returnDate: "2024-11-22",
      returnTime: "17:00",
    },
    status: "completed",
    paymentStatus: "paid",
    totalAmount: 35000,
    createdAt: "2024-11-18T09:00:00.000Z",
    updatedAt: "2024-11-22T18:00:00.000Z",
  },
  {
    id: "booking-hist-6",
    serviceType: "car-rental",
    customerDetails: {
      fullName: "Grace Akinyi Odhiambo",
      email: "grace.akinyi@yahoo.com",
      phone: "+254723456789",
      idNumber: "23456789",
    },
    vehicleDetails: {
      make: "Toyota",
      model: "Fortuner",
      rentalType: "self-drive",
    },
    tripDetails: {
      pickupLocation: "Kilimani",
      dropoffLocation: "Lake Naivasha",
      pickupDate: "2024-05-10",
      pickupTime: "06:00",
      returnDate: "2024-05-12",
      returnTime: "20:00",
    },
    status: "completed",
    paymentStatus: "paid",
    totalAmount: 28000,
    createdAt: "2024-05-08T10:00:00.000Z",
    updatedAt: "2024-05-12T21:00:00.000Z",
  },
  {
    id: "booking-hist-7",
    serviceType: "car-rental",
    customerDetails: {
      fullName: "Grace Akinyi Odhiambo",
      email: "grace.akinyi@yahoo.com",
      phone: "+254723456789",
      idNumber: "23456789",
    },
    vehicleDetails: {
      make: "Mazda",
      model: "CX-5",
      rentalType: "self-drive",
    },
    tripDetails: {
      pickupLocation: "JKIA Airport",
      dropoffLocation: "Kilimani",
      pickupDate: "2024-09-15",
      pickupTime: "14:00",
      returnDate: "2024-09-20",
      returnTime: "10:00",
    },
    status: "completed",
    paymentStatus: "partial",
    totalAmount: 42000,
    createdAt: "2024-09-12T08:00:00.000Z",
    updatedAt: "2024-09-22T11:00:00.000Z",
  },
  {
    id: "booking-hist-8",
    serviceType: "car-rental",
    customerDetails: {
      fullName: "Grace Akinyi Odhiambo",
      email: "grace.akinyi@yahoo.com",
      phone: "+254723456789",
      idNumber: "23456789",
    },
    vehicleDetails: {
      make: "Toyota",
      model: "RAV4",
      rentalType: "chauffeur-driven",
    },
    tripDetails: {
      pickupLocation: "Kilimani",
      dropoffLocation: "Amboseli",
      pickupDate: "2024-11-01",
      pickupTime: "05:00",
      returnDate: "2024-11-04",
      returnTime: "22:00",
    },
    status: "completed",
    paymentStatus: "unpaid",
    totalAmount: 65000,
    createdAt: "2024-10-28T12:00:00.000Z",
    updatedAt: "2024-11-04T23:00:00.000Z",
  },
  {
    id: "booking-hist-9",
    serviceType: "car-rental",
    customerDetails: {
      fullName: "David Kipchoge Korir",
      email: "david.kipchoge@outlook.com",
      phone: "+254734567890",
      idNumber: "34567890",
    },
    vehicleDetails: {
      make: "Toyota",
      model: "Prado TX",
      rentalType: "self-drive",
    },
    tripDetails: {
      pickupLocation: "Karen",
      dropoffLocation: "Maasai Mara",
      pickupDate: "2024-04-20",
      pickupTime: "05:00",
      returnDate: "2024-04-25",
      returnTime: "20:00",
    },
    status: "completed",
    paymentStatus: "paid",
    totalAmount: 85000,
    createdAt: "2024-04-15T14:00:00.000Z",
    updatedAt: "2024-04-25T21:00:00.000Z",
  },
  {
    id: "booking-hist-10",
    serviceType: "car-rental",
    customerDetails: {
      fullName: "David Kipchoge Korir",
      email: "david.kipchoge@outlook.com",
      phone: "+254734567890",
      idNumber: "34567890",
    },
    vehicleDetails: {
      make: "Toyota",
      model: "Land Cruiser V8",
      rentalType: "self-drive",
    },
    tripDetails: {
      pickupLocation: "Karen",
      dropoffLocation: "Samburu",
      pickupDate: "2024-08-10",
      pickupTime: "06:00",
      returnDate: "2024-08-17",
      returnTime: "18:00",
    },
    status: "completed",
    paymentStatus: "partial",
    totalAmount: 140000,
    createdAt: "2024-08-05T09:00:00.000Z",
    updatedAt: "2024-08-17T19:00:00.000Z",
  },
];

// Initialize demo booking history on first load
export function initializeDemoBookingHistory(): void {
  if (typeof window === "undefined") return;
  const existing = getBookings();
  if (existing.length === 0) {
    setStorage(BOOKINGS_KEY, demoBookingHistory);
  }
}

// ============================================
// ROGUE CLIENTS DATABASE
// ============================================

// Demo rogue clients for testing
const demoRogueClients: RogueClient[] = [
  {
    id: "rogue-1",
    fullName: "Patrick Otieno Wafula",
    idNumber: "28745612",
    phone: "+254799888777",
    alternativePhone: "+254711222333",
    email: "patrick.wafula@email.com",
    severity: "blacklisted",
    reason: "Stole a Toyota Prado TX from ABC Car Rentals in September 2024. Vehicle was never recovered. Police case filed.",
    incidents: [
      {
        id: "inc-1",
        date: "2024-09-15T00:00:00.000Z",
        type: "theft",
        description: "Rented Toyota Prado TX (KDA 456X) and disappeared with the vehicle. Police case OB/1234/2024 filed at Central Police Station.",
        amountOwed: 4500000,
        reportedBy: "ABC Car Rentals",
        vehicleInvolved: "Toyota Prado TX - KDA 456X",
      },
    ],
    reportedBy: "ABC Car Rentals",
    reportedAt: "2024-09-20T00:00:00.000Z",
    lastUpdated: "2024-09-20T00:00:00.000Z",
    isActive: true,
  },
  {
    id: "rogue-2",
    fullName: "Mercy Njeri Kamau",
    idNumber: "31254789",
    phone: "+254722111444",
    severity: "fraud",
    reason: "Used fake ID documents to rent vehicles from multiple companies. Suspected syndicate member.",
    incidents: [
      {
        id: "inc-2",
        date: "2024-07-10T00:00:00.000Z",
        type: "fraud",
        description: "Presented fake ID (31254789) which was later found to belong to someone else. Rented Nissan X-Trail and caused accident while fleeing.",
        amountOwed: 850000,
        reportedBy: "XYZ Auto Hire",
        vehicleInvolved: "Nissan X-Trail - KCY 234B",
      },
      {
        id: "inc-3",
        date: "2024-08-22T00:00:00.000Z",
        type: "fraud",
        description: "Attempted to use same fake documents at another rental company. Alert raised and she fled.",
        reportedBy: "Nairobi Car Rentals",
      },
    ],
    reportedBy: "XYZ Auto Hire",
    reportedAt: "2024-07-12T00:00:00.000Z",
    lastUpdated: "2024-08-22T00:00:00.000Z",
    isActive: true,
  },
  {
    id: "rogue-3",
    fullName: "Samuel Kiprono Bett",
    idNumber: "25698741",
    phone: "+254733555666",
    alternativePhone: "+254700123456",
    severity: "high-risk",
    reason: "Multiple instances of non-payment and vehicle damage. Currently owes KES 285,000 to various companies.",
    incidents: [
      {
        id: "inc-4",
        date: "2024-05-05T00:00:00.000Z",
        type: "non-payment",
        description: "Rented vehicle for 2 weeks, returned with major damage to suspension and refused to pay for repairs.",
        amountOwed: 120000,
        reportedBy: "Safari Car Hire",
        vehicleInvolved: "Toyota Hilux - KDG 789C",
      },
      {
        id: "inc-5",
        date: "2024-08-14T00:00:00.000Z",
        type: "damage",
        description: "Returned Subaru Forester with major body damage. Claimed it was not his fault and left without paying.",
        amountOwed: 165000,
        reportedBy: "Mombasa Wheels",
        vehicleInvolved: "Subaru Forester - KCZ 567D",
      },
    ],
    reportedBy: "Safari Car Hire",
    reportedAt: "2024-05-08T00:00:00.000Z",
    lastUpdated: "2024-08-16T00:00:00.000Z",
    isActive: true,
  },
  {
    id: "rogue-4",
    fullName: "Elizabeth Wanjiku Maina",
    idNumber: "29876543",
    phone: "+254755444333",
    severity: "warning",
    reason: "History of late returns and minor payment disputes. Proceed with caution and require full deposit.",
    incidents: [
      {
        id: "inc-6",
        date: "2024-04-20T00:00:00.000Z",
        type: "non-payment",
        description: "Late payment of KES 35,000 which was eventually settled after 3 months of follow-up.",
        amountOwed: 0,
        reportedBy: "Nairobi Express Rentals",
      },
      {
        id: "inc-7",
        date: "2024-10-01T00:00:00.000Z",
        type: "other",
        description: "Returned vehicle 5 days late without communication. Eventually returned but caused booking conflicts.",
        reportedBy: "Quick Ride Rentals",
        vehicleInvolved: "Honda CR-V - KDD 123E",
      },
    ],
    reportedBy: "Nairobi Express Rentals",
    reportedAt: "2024-04-25T00:00:00.000Z",
    lastUpdated: "2024-10-03T00:00:00.000Z",
    isActive: true,
  },
  {
    id: "rogue-5",
    fullName: "John Mutua Kyalo",
    idNumber: "27456321",
    phone: "+254766777888",
    email: "john.mutua.kyalo@gmail.com",
    severity: "blacklisted",
    reason: "Involved in accident while drunk driving. Fled scene and abandoned rental vehicle. Insurance claim denied due to DUI.",
    incidents: [
      {
        id: "inc-8",
        date: "2024-06-30T00:00:00.000Z",
        type: "accident",
        description: "Caused major accident on Mombasa Road while under influence. Fled scene leaving severely damaged Mercedes C200. Third party injuries reported. Police case ongoing.",
        amountOwed: 2800000,
        reportedBy: "Premium Auto Rentals",
        vehicleInvolved: "Mercedes C200 - KDB 999F",
      },
    ],
    reportedBy: "Premium Auto Rentals",
    reportedAt: "2024-07-02T00:00:00.000Z",
    lastUpdated: "2024-07-02T00:00:00.000Z",
    isActive: true,
  },
];

// Get all rogue clients
export function getRogueClients(): RogueClient[] {
  const data = getStorage<RogueClient[]>(ROGUE_CLIENTS_KEY);
  if (!data || data.length === 0) {
    // Initialize with demo data
    setStorage(ROGUE_CLIENTS_KEY, demoRogueClients);
    return demoRogueClients;
  }
  return data;
}

// Search rogue clients by name, ID, or phone
export function searchRogueClients(query: string): RogueClient[] {
  if (!query || query.length < 2) return [];
  
  const rogueClients = getRogueClients();
  const searchTerm = query.toLowerCase().trim();
  
  return rogueClients.filter((client) => {
    const nameMatch = client.fullName.toLowerCase().includes(searchTerm);
    const idMatch = client.idNumber.includes(searchTerm);
    const phoneMatch = client.phone?.includes(searchTerm) || client.alternativePhone?.includes(searchTerm);
    const emailMatch = client.email?.toLowerCase().includes(searchTerm);
    
    return (nameMatch || idMatch || phoneMatch || emailMatch) && client.isActive;
  });
}

// Check if a specific person is in rogue database
export function checkRogueClient(idNumber?: string, phone?: string, name?: string): RogueClient | null {
  const rogueClients = getRogueClients();
  
  for (const rogue of rogueClients) {
    if (!rogue.isActive) continue;
    
    // Exact ID match
    if (idNumber && rogue.idNumber === idNumber) {
      return rogue;
    }
    
    // Phone match (check both phone numbers)
    if (phone) {
      const cleanPhone = phone.replace(/\D/g, "").slice(-9); // Get last 9 digits
      const roguePhone1 = rogue.phone?.replace(/\D/g, "").slice(-9);
      const roguePhone2 = rogue.alternativePhone?.replace(/\D/g, "").slice(-9);
      
      if (cleanPhone === roguePhone1 || cleanPhone === roguePhone2) {
        return rogue;
      }
    }
    
    // Fuzzy name match (for close matches)
    if (name && name.length >= 5) {
      const nameLower = name.toLowerCase();
      const rogueName = rogue.fullName.toLowerCase();
      
      // Check if significant part of name matches
      const nameParts = nameLower.split(" ");
      const rogueNameParts = rogueName.split(" ");
      
      const matchingParts = nameParts.filter(part => 
        part.length >= 3 && rogueNameParts.some(rp => rp.includes(part) || part.includes(rp))
      );
      
      if (matchingParts.length >= 2) {
        return rogue;
      }
    }
  }
  
  return null;
}

// Add new rogue client
export function addRogueClient(rogueClient: RogueClient): void {
  const rogueClients = getRogueClients();
  rogueClients.push(rogueClient);
  setStorage(ROGUE_CLIENTS_KEY, rogueClients);
}

// Update rogue client
export function updateRogueClient(id: string, updates: Partial<RogueClient>): RogueClient | null {
  const rogueClients = getRogueClients();
  const index = rogueClients.findIndex(r => r.id === id);
  
  if (index >= 0) {
    rogueClients[index] = { 
      ...rogueClients[index], 
      ...updates, 
      lastUpdated: new Date().toISOString() 
    };
    setStorage(ROGUE_CLIENTS_KEY, rogueClients);
    return rogueClients[index];
  }
  return null;
}

// Deactivate rogue client (when resolved)
export function deactivateRogueClient(id: string): boolean {
  const rogueClients = getRogueClients();
  const index = rogueClients.findIndex(r => r.id === id);
  
  if (index >= 0) {
    rogueClients[index].isActive = false;
    rogueClients[index].lastUpdated = new Date().toISOString();
    setStorage(ROGUE_CLIENTS_KEY, rogueClients);
    return true;
  }
  return false;
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

// Clients Store (for returning customers)
export function getClients(): Client[] {
  const clients = getStorage<Client[]>(CLIENTS_KEY, []);
  // Initialize with demo clients if empty
  if (clients.length === 0) {
    setStorage(CLIENTS_KEY, demoClients);
    return demoClients;
  }
  return clients;
}

export function getClientById(id: string): Client | undefined {
  const clients = getClients();
  return clients.find((c) => c.id === id);
}

export function getClientByIdNumber(idNumber: string): Client | undefined {
  const clients = getClients();
  return clients.find((c) => c.idNumber.toLowerCase() === idNumber.toLowerCase());
}

export function getClientByPhone(phone: string): Client | undefined {
  const clients = getClients();
  const cleanPhone = phone.replace(/\D/g, '');
  return clients.find((c) => c.phone.replace(/\D/g, '') === cleanPhone || c.alternativePhone?.replace(/\D/g, '') === cleanPhone);
}

export function searchClients(query: string): Client[] {
  const clients = getClients();
  const lowerQuery = query.toLowerCase();
  return clients.filter((c) => 
    c.fullName.toLowerCase().includes(lowerQuery) ||
    c.idNumber.toLowerCase().includes(lowerQuery) ||
    c.phone.includes(query) ||
    c.email?.toLowerCase().includes(lowerQuery)
  );
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

export function saveClientFromBooking(booking: Booking): Client | undefined {
  if (booking.serviceType !== "car-rental") return undefined;
  
  const carBooking = booking as import("@/types").CarRentalBooking;
  const existingClient = getClientByIdNumber(carBooking.personalDetails.idNumber);
  
  const client: Client = {
    id: existingClient?.id || generateId(),
    fullName: carBooking.personalDetails.fullName,
    idNumber: carBooking.personalDetails.idNumber,
    idPhotoUrl: carBooking.personalDetails.idPhotoUrl,
    drivingLicenseNumber: carBooking.personalDetails.drivingLicenseNumber,
    drivingLicenseUrl: carBooking.personalDetails.drivingLicenseUrl,
    placeOfWork: carBooking.personalDetails.placeOfWork,
    kraPin: carBooking.personalDetails.kraPin,
    residence: carBooking.personalDetails.residence,
    phone: carBooking.personalDetails.phone,
    alternativePhone: carBooking.personalDetails.alternativePhone,
    email: carBooking.customerEmail,
    nextOfKin: carBooking.personalDetails.nextOfKin,
    fingerprintLeftUrl: carBooking.personalDetails.fingerprintLeftUrl,
    fingerprintRightUrl: carBooking.personalDetails.fingerprintRightUrl,
    passportPhotoUrl: carBooking.personalDetails.passportPhotoUrl,
    totalBookings: (existingClient?.totalBookings || 0) + 1,
    createdAt: existingClient?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  return saveClient(client);
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
