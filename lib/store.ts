"use client";

import type { Booking, AdminUser, MpesaPayment, Client, RogueClient } from "@/types";

const BOOKINGS_KEY = "savannah_link_bookings";
const USERS_KEY = "savannah_link_users";
const PAYMENTS_KEY = "savannah_link_payments";
const CLIENTS_KEY = "savannah_link_clients";
const ROGUE_CLIENTS_KEY = "savannah_link_rogue_clients";

// Demo clients for testing - 30 records
const demoClients: Client[] = [
  // Record 1: Peter Mwangi Kariuki - Complete profile with all documents
  {
    id: "client-demo-1",
    fullName: "Peter Mwangi Kariuki",
    idNumber: "24567891",
    phone: "+254712345678",
    alternativePhone: "+254798765432",
    email: "peter.kariuki@gmail.com",
    residence: "Kilimani Estate, Argwings Kodhek Road, Nairobi",
    placeOfWork: "Self Employed - Kariuki Enterprises Ltd",
    kraPin: "A019283746B",
    drivingLicenseNumber: "DL908172",
    // Demo placeholder images - in production these would be actual uploaded files
    passportPhotoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=250&fit=crop&crop=face",
    idPhotoUrl: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&h=250&fit=crop",
    drivingLicenseUrl: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&h=250&fit=crop",
    leftFingerprint: "L-FP-L-9A7C21",
    rightFingerprint: "R-FP-R-3D8F55",
    fingerprintLeftUrl: "",
    fingerprintRightUrl: "",
    nextOfKin: {
      name: "Jane Wanjiru Kariuki",
      phone: "+254723456789",
      relationship: "Spouse",
    },
    totalBookings: 8,
    totalSpent: 485000,
    lastBookingDate: "2026-04-28",
    totalDebt: 0,
    riskLevel: "low",
    notes: "VIP client - always pays on time. Prefers Toyota Land Cruiser for safari trips.",
    createdAt: "2024-03-15",
    updatedAt: "2026-05-03T09:00:00.000Z",
  },
  // Record 2: Brian Otieno Ouma - Complete profile
  {
    id: "client-demo-2",
    fullName: "Brian Otieno Ouma",
    idNumber: "33445566",
    phone: "+254722334455",
    alternativePhone: "+254711998877",
    email: "brian.otieno@techsolutions.co.ke",
    residence: "South B Estate, Mombasa Road, Nairobi",
    placeOfWork: "Tech Solutions Ltd - Software Engineer",
    kraPin: "A112233445C",
    drivingLicenseNumber: "DL556677",
    passportPhotoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=250&fit=crop&crop=face",
    idPhotoUrl: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&h=250&fit=crop",
    drivingLicenseUrl: "",
    leftFingerprint: "L-FP-L-2B6K88",
    rightFingerprint: "R-FP-R-7H2M44",
    fingerprintLeftUrl: "",
    fingerprintRightUrl: "",
    nextOfKin: {
      name: "Sarah Achieng Ouma",
      phone: "+254733445566",
      relationship: "Sibling",
    },
    totalBookings: 5,
    totalSpent: 127500,
    lastBookingDate: "2026-04-15",
    totalDebt: 0,
    riskLevel: "low",
    notes: "Corporate client - bills sent to employer. Prefers sedans for business trips.",
    createdAt: "2024-08-20",
    updatedAt: "2026-05-04T08:00:00.000Z",
  },
  // Record 3: Kevin Mutiso Musyoka - High-risk client
  {
    id: "client-demo-3",
    fullName: "Kevin Mutiso Musyoka",
    idNumber: "29887766",
    phone: "+254700112233",
    alternativePhone: "+254722887766",
    email: "kevin.mutiso@gmail.com",
    residence: "Embakasi Estate, Outer Ring Road, Nairobi",
    placeOfWork: "Ministry of Finance - Accountant",
    kraPin: "A223344556D",
    drivingLicenseNumber: "DL778899",
    passportPhotoUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=250&fit=crop&crop=face",
    idPhotoUrl: "",
    drivingLicenseUrl: "",
    leftFingerprint: "L-FP-L-6T1P09",
    rightFingerprint: "R-FP-R-8Q4Z66",
    fingerprintLeftUrl: "",
    fingerprintRightUrl: "",
    nextOfKin: {
      name: "Ruth Mutiso",
      phone: "+254711223344",
      relationship: "Mother",
    },
    totalBookings: 3,
    totalSpent: 78500,
    lastBookingDate: "2026-03-10",
    totalDebt: 45000,
    riskLevel: "high",
    notes: "CAUTION: Has outstanding debt of KES 45,000 from previous rental. Requires deposit and advance payment.",
    alerts: [
      {
        id: "alert-1",
        type: "debt",
        title: "Outstanding Balance",
        description: "Unpaid balance from car rental on 15 March 2026",
        amount: 45000,
        date: "2026-03-15",
        resolved: false,
      },
    ],
    createdAt: "2025-01-10",
    updatedAt: "2026-05-02T10:00:00.000Z",
  },
  // Records 4-30: Demo Customers with basic info
  {
    id: "client-demo-4",
    fullName: "Demo Customer 4",
    idNumber: "20000004",
    phone: "+254700000004",
    email: "demo4@example.com",
    residence: "Nairobi",
    placeOfWork: "Company Ltd",
    kraPin: "A000000004X",
    drivingLicenseNumber: "DL4XYZ",
    leftFingerprint: "L-FP-4A4",
    rightFingerprint: "R-FP-4B4",
    nextOfKin: { name: "Next of Kin 4", phone: "+254711000004", relationship: "Spouse" },
    totalBookings: 0,
    riskLevel: "low",
    createdAt: "2026-01-01T10:00:00.000Z",
    updatedAt: "2026-01-01T10:00:00.000Z",
  },
  {
    id: "client-demo-5",
    fullName: "Demo Customer 5",
    idNumber: "20000005",
    phone: "+254700000005",
    email: "demo5@example.com",
    residence: "Nairobi",
    placeOfWork: "Company Ltd",
    kraPin: "A000000005X",
    drivingLicenseNumber: "DL5XYZ",
    leftFingerprint: "L-FP-5A5",
    rightFingerprint: "R-FP-5B5",
    nextOfKin: { name: "Next of Kin 5", phone: "+254711000005", relationship: "Sibling" },
    totalBookings: 0,
    riskLevel: "low",
    createdAt: "2026-01-01T10:00:00.000Z",
    updatedAt: "2026-01-01T10:00:00.000Z",
  },
  {
    id: "client-demo-6",
    fullName: "Demo Customer 6",
    idNumber: "20000006",
    phone: "+254700000006",
    email: "demo6@example.com",
    residence: "Mombasa",
    placeOfWork: "Coastal Corp",
    kraPin: "A000000006X",
    drivingLicenseNumber: "DL6XYZ",
    leftFingerprint: "L-FP-6A6",
    rightFingerprint: "R-FP-6B6",
    nextOfKin: { name: "Next of Kin 6", phone: "+254711000006", relationship: "Parent" },
    totalBookings: 0,
    riskLevel: "low",
    createdAt: "2026-01-01T10:00:00.000Z",
    updatedAt: "2026-01-01T10:00:00.000Z",
  },
  {
    id: "client-demo-7",
    fullName: "Demo Customer 7",
    idNumber: "20000007",
    phone: "+254700000007",
    email: "demo7@example.com",
    residence: "Kisumu",
    placeOfWork: "Lake Industries",
    kraPin: "A000000007X",
    drivingLicenseNumber: "DL7XYZ",
    leftFingerprint: "L-FP-7A7",
    rightFingerprint: "R-FP-7B7",
    nextOfKin: { name: "Next of Kin 7", phone: "+254711000007", relationship: "Spouse" },
    totalBookings: 0,
    riskLevel: "medium",
    createdAt: "2026-01-01T10:00:00.000Z",
    updatedAt: "2026-01-01T10:00:00.000Z",
  },
  {
    id: "client-demo-8",
    fullName: "Demo Customer 8",
    idNumber: "20000008",
    phone: "+254700000008",
    email: "demo8@example.com",
    residence: "Nakuru",
    placeOfWork: "Rift Valley Ltd",
    kraPin: "A000000008X",
    drivingLicenseNumber: "DL8XYZ",
    leftFingerprint: "L-FP-8A8",
    rightFingerprint: "R-FP-8B8",
    nextOfKin: { name: "Next of Kin 8", phone: "+254711000008", relationship: "Sibling" },
    totalBookings: 0,
    riskLevel: "low",
    createdAt: "2026-01-01T10:00:00.000Z",
    updatedAt: "2026-01-01T10:00:00.000Z",
  },
  {
    id: "client-demo-9",
    fullName: "Demo Customer 9",
    idNumber: "20000009",
    phone: "+254700000009",
    email: "demo9@example.com",
    residence: "Eldoret",
    placeOfWork: "Highland Corp",
    kraPin: "A000000009X",
    drivingLicenseNumber: "DL9XYZ",
    leftFingerprint: "L-FP-9A9",
    rightFingerprint: "R-FP-9B9",
    nextOfKin: { name: "Next of Kin 9", phone: "+254711000009", relationship: "Parent" },
    totalBookings: 0,
    riskLevel: "low",
    createdAt: "2026-01-01T10:00:00.000Z",
    updatedAt: "2026-01-01T10:00:00.000Z",
  },
  {
    id: "client-demo-10",
    fullName: "Demo Customer 10",
    idNumber: "20000010",
    phone: "+254700000010",
    email: "demo10@example.com",
    residence: "Thika",
    placeOfWork: "Central Industries",
    kraPin: "A000000010X",
    drivingLicenseNumber: "DL10XYZ",
    leftFingerprint: "L-FP-10A10",
    rightFingerprint: "R-FP-10B10",
    nextOfKin: { name: "Next of Kin 10", phone: "+254711000010", relationship: "Spouse" },
    totalBookings: 0,
    riskLevel: "low",
    createdAt: "2026-01-01T10:00:00.000Z",
    updatedAt: "2026-01-01T10:00:00.000Z",
  },
  {
    id: "client-demo-11",
    fullName: "Demo Customer 11",
    idNumber: "20000011",
    phone: "+254700000011",
    email: "demo11@example.com",
    residence: "Nairobi",
    placeOfWork: "Tech Hub",
    kraPin: "A000000011X",
    drivingLicenseNumber: "DL11XYZ",
    leftFingerprint: "L-FP-11A11",
    rightFingerprint: "R-FP-11B11",
    nextOfKin: { name: "Next of Kin 11", phone: "+254711000011", relationship: "Sibling" },
    totalBookings: 0,
    riskLevel: "low",
    createdAt: "2026-01-01T10:00:00.000Z",
    updatedAt: "2026-01-01T10:00:00.000Z",
  },
  {
    id: "client-demo-12",
    fullName: "Demo Customer 12",
    idNumber: "20000012",
    phone: "+254700000012",
    email: "demo12@example.com",
    residence: "Nairobi",
    placeOfWork: "Finance Corp",
    kraPin: "A000000012X",
    drivingLicenseNumber: "DL12XYZ",
    leftFingerprint: "L-FP-12A12",
    rightFingerprint: "R-FP-12B12",
    nextOfKin: { name: "Next of Kin 12", phone: "+254711000012", relationship: "Parent" },
    totalBookings: 0,
    riskLevel: "high",
    totalDebt: 50000,
    alerts: [
      {
        id: "alert-12-1",
        type: "debt",
        title: "Outstanding Balance",
        description: "Unpaid rental balance from previous booking.",
        amount: 50000,
        date: "2026-03-01T00:00:00.000Z",
        resolved: false,
      },
    ],
    notes: "Monitor payment status closely.",
    createdAt: "2026-01-01T10:00:00.000Z",
    updatedAt: "2026-03-01T10:00:00.000Z",
  },
  {
    id: "client-demo-13",
    fullName: "Demo Customer 13",
    idNumber: "20000013",
    phone: "+254700000013",
    email: "demo13@example.com",
    residence: "Nairobi",
    placeOfWork: "Media House",
    kraPin: "A000000013X",
    drivingLicenseNumber: "DL13XYZ",
    leftFingerprint: "L-FP-13A13",
    rightFingerprint: "R-FP-13B13",
    nextOfKin: { name: "Next of Kin 13", phone: "+254711000013", relationship: "Spouse" },
    totalBookings: 0,
    riskLevel: "low",
    createdAt: "2026-01-01T10:00:00.000Z",
    updatedAt: "2026-01-01T10:00:00.000Z",
  },
  {
    id: "client-demo-14",
    fullName: "Demo Customer 14",
    idNumber: "20000014",
    phone: "+254700000014",
    email: "demo14@example.com",
    residence: "Nairobi",
    placeOfWork: "Healthcare Ltd",
    kraPin: "A000000014X",
    drivingLicenseNumber: "DL14XYZ",
    leftFingerprint: "L-FP-14A14",
    rightFingerprint: "R-FP-14B14",
    nextOfKin: { name: "Next of Kin 14", phone: "+254711000014", relationship: "Sibling" },
    totalBookings: 0,
    riskLevel: "low",
    createdAt: "2026-01-01T10:00:00.000Z",
    updatedAt: "2026-01-01T10:00:00.000Z",
  },
  {
    id: "client-demo-15",
    fullName: "Demo Customer 15",
    idNumber: "20000015",
    phone: "+254700000015",
    email: "demo15@example.com",
    residence: "Nairobi",
    placeOfWork: "Education Services",
    kraPin: "A000000015X",
    drivingLicenseNumber: "DL15XYZ",
    leftFingerprint: "L-FP-15A15",
    rightFingerprint: "R-FP-15B15",
    nextOfKin: { name: "Next of Kin 15", phone: "+254711000015", relationship: "Parent" },
    totalBookings: 0,
    riskLevel: "blocked",
    alerts: [
      {
        id: "alert-15-1",
        type: "blacklisted",
        title: "BLACKLISTED",
        description: "Attempted vehicle theft. Do not rent.",
        date: "2026-02-15T00:00:00.000Z",
        resolved: false,
      },
    ],
    notes: "DO NOT RENT - Contact management if this client appears.",
    createdAt: "2026-01-01T10:00:00.000Z",
    updatedAt: "2026-02-15T10:00:00.000Z",
  },
  {
    id: "client-demo-16",
    fullName: "Demo Customer 16",
    idNumber: "20000016",
    phone: "+254700000016",
    email: "demo16@example.com",
    residence: "Mombasa",
    placeOfWork: "Shipping Co",
    kraPin: "A000000016X",
    drivingLicenseNumber: "DL16XYZ",
    leftFingerprint: "L-FP-16A16",
    rightFingerprint: "R-FP-16B16",
    nextOfKin: { name: "Next of Kin 16", phone: "+254711000016", relationship: "Spouse" },
    totalBookings: 0,
    riskLevel: "low",
    createdAt: "2026-01-01T10:00:00.000Z",
    updatedAt: "2026-01-01T10:00:00.000Z",
  },
  {
    id: "client-demo-17",
    fullName: "Demo Customer 17",
    idNumber: "20000017",
    phone: "+254700000017",
    email: "demo17@example.com",
    residence: "Kisumu",
    placeOfWork: "Agriculture Ltd",
    kraPin: "A000000017X",
    drivingLicenseNumber: "DL17XYZ",
    leftFingerprint: "L-FP-17A17",
    rightFingerprint: "R-FP-17B17",
    nextOfKin: { name: "Next of Kin 17", phone: "+254711000017", relationship: "Sibling" },
    totalBookings: 0,
    riskLevel: "low",
    createdAt: "2026-01-01T10:00:00.000Z",
    updatedAt: "2026-01-01T10:00:00.000Z",
  },
  {
    id: "client-demo-18",
    fullName: "Demo Customer 18",
    idNumber: "20000018",
    phone: "+254700000018",
    email: "demo18@example.com",
    residence: "Nakuru",
    placeOfWork: "Tourism Board",
    kraPin: "A000000018X",
    drivingLicenseNumber: "DL18XYZ",
    leftFingerprint: "L-FP-18A18",
    rightFingerprint: "R-FP-18B18",
    nextOfKin: { name: "Next of Kin 18", phone: "+254711000018", relationship: "Parent" },
    totalBookings: 0,
    riskLevel: "medium",
    notes: "Previous late return. Proceed with caution.",
    createdAt: "2026-01-01T10:00:00.000Z",
    updatedAt: "2026-01-01T10:00:00.000Z",
  },
  {
    id: "client-demo-19",
    fullName: "Demo Customer 19",
    idNumber: "20000019",
    phone: "+254700000019",
    email: "demo19@example.com",
    residence: "Eldoret",
    placeOfWork: "Sports Academy",
    kraPin: "A000000019X",
    drivingLicenseNumber: "DL19XYZ",
    leftFingerprint: "L-FP-19A19",
    rightFingerprint: "R-FP-19B19",
    nextOfKin: { name: "Next of Kin 19", phone: "+254711000019", relationship: "Spouse" },
    totalBookings: 0,
    riskLevel: "low",
    createdAt: "2026-01-01T10:00:00.000Z",
    updatedAt: "2026-01-01T10:00:00.000Z",
  },
  {
    id: "client-demo-20",
    fullName: "Demo Customer 20",
    idNumber: "20000020",
    phone: "+254700000020",
    email: "demo20@example.com",
    residence: "Nairobi",
    placeOfWork: "Construction Ltd",
    kraPin: "A000000020X",
    drivingLicenseNumber: "DL20XYZ",
    leftFingerprint: "L-FP-20A20",
    rightFingerprint: "R-FP-20B20",
    nextOfKin: { name: "Next of Kin 20", phone: "+254711000020", relationship: "Sibling" },
    totalBookings: 0,
    riskLevel: "low",
    createdAt: "2026-01-01T10:00:00.000Z",
    updatedAt: "2026-01-01T10:00:00.000Z",
  },
  {
    id: "client-demo-21",
    fullName: "Demo Customer 21",
    idNumber: "20000021",
    phone: "+254700000021",
    email: "demo21@example.com",
    residence: "Nairobi",
    placeOfWork: "IT Solutions",
    kraPin: "A000000021X",
    drivingLicenseNumber: "DL21XYZ",
    leftFingerprint: "L-FP-21A21",
    rightFingerprint: "R-FP-21B21",
    nextOfKin: { name: "Next of Kin 21", phone: "+254711000021", relationship: "Parent" },
    totalBookings: 0,
    riskLevel: "low",
    createdAt: "2026-01-01T10:00:00.000Z",
    updatedAt: "2026-01-01T10:00:00.000Z",
  },
  {
    id: "client-demo-22",
    fullName: "Demo Customer 22",
    idNumber: "20000022",
    phone: "+254700000022",
    email: "demo22@example.com",
    residence: "Nairobi",
    placeOfWork: "Legal Firm",
    kraPin: "A000000022X",
    drivingLicenseNumber: "DL22XYZ",
    leftFingerprint: "L-FP-22A22",
    rightFingerprint: "R-FP-22B22",
    nextOfKin: { name: "Next of Kin 22", phone: "+254711000022", relationship: "Spouse" },
    totalBookings: 0,
    riskLevel: "low",
    createdAt: "2026-01-01T10:00:00.000Z",
    updatedAt: "2026-01-01T10:00:00.000Z",
  },
  {
    id: "client-demo-23",
    fullName: "Demo Customer 23",
    idNumber: "20000023",
    phone: "+254700000023",
    email: "demo23@example.com",
    residence: "Nairobi",
    placeOfWork: "Insurance Co",
    kraPin: "A000000023X",
    drivingLicenseNumber: "DL23XYZ",
    leftFingerprint: "L-FP-23A23",
    rightFingerprint: "R-FP-23B23",
    nextOfKin: { name: "Next of Kin 23", phone: "+254711000023", relationship: "Sibling" },
    totalBookings: 0,
    riskLevel: "low",
    createdAt: "2026-01-01T10:00:00.000Z",
    updatedAt: "2026-01-01T10:00:00.000Z",
  },
  {
    id: "client-demo-24",
    fullName: "Demo Customer 24",
    idNumber: "20000024",
    phone: "+254700000024",
    email: "demo24@example.com",
    residence: "Nairobi",
    placeOfWork: "Real Estate",
    kraPin: "A000000024X",
    drivingLicenseNumber: "DL24XYZ",
    leftFingerprint: "L-FP-24A24",
    rightFingerprint: "R-FP-24B24",
    nextOfKin: { name: "Next of Kin 24", phone: "+254711000024", relationship: "Parent" },
    totalBookings: 0,
    riskLevel: "low",
    createdAt: "2026-01-01T10:00:00.000Z",
    updatedAt: "2026-01-01T10:00:00.000Z",
  },
  {
    id: "client-demo-25",
    fullName: "Demo Customer 25",
    idNumber: "20000025",
    phone: "+254700000025",
    email: "demo25@example.com",
    residence: "Nairobi",
    placeOfWork: "Retail Chain",
    kraPin: "A000000025X",
    drivingLicenseNumber: "DL25XYZ",
    leftFingerprint: "L-FP-25A25",
    rightFingerprint: "R-FP-25B25",
    nextOfKin: { name: "Next of Kin 25", phone: "+254711000025", relationship: "Spouse" },
    totalBookings: 0,
    riskLevel: "low",
    createdAt: "2026-01-01T10:00:00.000Z",
    updatedAt: "2026-01-01T10:00:00.000Z",
  },
  {
    id: "client-demo-26",
    fullName: "Demo Customer 26",
    idNumber: "20000026",
    phone: "+254700000026",
    email: "demo26@example.com",
    residence: "Mombasa",
    placeOfWork: "Hospitality Group",
    kraPin: "A000000026X",
    drivingLicenseNumber: "DL26XYZ",
    leftFingerprint: "L-FP-26A26",
    rightFingerprint: "R-FP-26B26",
    nextOfKin: { name: "Next of Kin 26", phone: "+254711000026", relationship: "Sibling" },
    totalBookings: 0,
    riskLevel: "low",
    createdAt: "2026-01-01T10:00:00.000Z",
    updatedAt: "2026-01-01T10:00:00.000Z",
  },
  {
    id: "client-demo-27",
    fullName: "Demo Customer 27",
    idNumber: "20000027",
    phone: "+254700000027",
    email: "demo27@example.com",
    residence: "Kisumu",
    placeOfWork: "Manufacturing",
    kraPin: "A000000027X",
    drivingLicenseNumber: "DL27XYZ",
    leftFingerprint: "L-FP-27A27",
    rightFingerprint: "R-FP-27B27",
    nextOfKin: { name: "Next of Kin 27", phone: "+254711000027", relationship: "Parent" },
    totalBookings: 0,
    riskLevel: "low",
    createdAt: "2026-01-01T10:00:00.000Z",
    updatedAt: "2026-01-01T10:00:00.000Z",
  },
  {
    id: "client-demo-28",
    fullName: "Demo Customer 28",
    idNumber: "20000028",
    phone: "+254700000028",
    email: "demo28@example.com",
    residence: "Nakuru",
    placeOfWork: "Logistics Co",
    kraPin: "A000000028X",
    drivingLicenseNumber: "DL28XYZ",
    leftFingerprint: "L-FP-28A28",
    rightFingerprint: "R-FP-28B28",
    nextOfKin: { name: "Next of Kin 28", phone: "+254711000028", relationship: "Spouse" },
    totalBookings: 0,
    riskLevel: "low",
    createdAt: "2026-01-01T10:00:00.000Z",
    updatedAt: "2026-01-01T10:00:00.000Z",
  },
  {
    id: "client-demo-29",
    fullName: "Demo Customer 29",
    idNumber: "20000029",
    phone: "+254700000029",
    email: "demo29@example.com",
    residence: "Eldoret",
    placeOfWork: "Telecom Ltd",
    kraPin: "A000000029X",
    drivingLicenseNumber: "DL29XYZ",
    leftFingerprint: "L-FP-29A29",
    rightFingerprint: "R-FP-29B29",
    nextOfKin: { name: "Next of Kin 29", phone: "+254711000029", relationship: "Sibling" },
    totalBookings: 0,
    riskLevel: "low",
    createdAt: "2026-01-01T10:00:00.000Z",
    updatedAt: "2026-01-01T10:00:00.000Z",
  },
  {
    id: "client-demo-30",
    fullName: "Demo Customer 30",
    idNumber: "20000030",
    phone: "+254700000030",
    email: "demo30@example.com",
    residence: "Nairobi",
    placeOfWork: "Energy Corp",
    kraPin: "A000000030X",
    drivingLicenseNumber: "DL30XYZ",
    leftFingerprint: "L-FP-30A30",
    rightFingerprint: "R-FP-30B30",
    nextOfKin: { name: "Next of Kin 30", phone: "+254711000030", relationship: "Parent" },
    totalBookings: 0,
    riskLevel: "low",
    createdAt: "2026-01-01T10:00:00.000Z",
    updatedAt: "2026-01-01T10:00:00.000Z",
  },
];

// Initialize default admin users
const defaultUsers: AdminUser[] = [
  {
    id: "admin-1",
    name: "Admin User",
    email: "admin@moventrasafarislogisticsltd.com",
    role: "admin",
    createdAt: new Date().toISOString(),
  },
  {
    id: "staff-1",
    name: "John Kamau",
    email: "john@Moventra Safaris & Logistics Ltd.co.ke",
    role: "staff",
    createdAt: new Date().toISOString(),
  },
  {
    id: "staff-2",
    name: "Mary Wanjiku",
    email: "mary@Moventra Safaris & Logistics Ltd.co.ke",
    role: "staff",
    createdAt: new Date().toISOString(),
  },
  {
    id: "staff-3",
    name: "Peter Ochieng",
    email: "peter@Moventra Safaris & Logistics Ltd.co.ke",
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

// Demo booking history for testing - matches demo customers
const demoBookingHistory: Booking[] = [
  // Record 1: Peter Mwangi Kariuki - Toyota Prado to Naivasha
  {
    id: "booking-hist-1",
    serviceType: "car-rental",
    customerDetails: {
      fullName: "Peter Mwangi Kariuki",
      email: "peter.kariuki@gmail.com",
      phone: "+254712345678",
      idNumber: "24567891",
    },
    vehicleDetails: {
      make: "Toyota",
      model: "Prado",
      numberPlate: "KDB 234Y",
      rentalType: "self-drive",
    },
    tripDetails: {
      pickupLocation: "Kilimani, Nairobi",
      dropoffLocation: "Naivasha",
      pickupDate: "2026-05-03",
      pickupTime: "09:00",
      returnDate: "2026-05-05",
      returnTime: "18:00",
      mileageOut: 52340,
      fuelLevelOut: "Full",
    },
    status: "confirmed",
    paymentStatus: "paid",
    totalAmount: 24000,
    createdAt: "2026-05-03T09:00:00.000Z",
    updatedAt: "2026-05-03T09:00:00.000Z",
  },
  // Record 2: Brian Otieno Ouma - Mazda CX-5 to Nakuru
  {
    id: "booking-hist-2",
    serviceType: "car-rental",
    customerDetails: {
      fullName: "Brian Otieno Ouma",
      email: "brian.otieno@gmail.com",
      phone: "+254722334455",
      idNumber: "33445566",
    },
    vehicleDetails: {
      make: "Mazda",
      model: "CX-5",
      numberPlate: "KDA 890K",
      rentalType: "self-drive",
    },
    tripDetails: {
      pickupLocation: "South B, Nairobi",
      dropoffLocation: "Nakuru",
      pickupDate: "2026-05-04",
      pickupTime: "08:00",
      returnDate: "2026-05-07",
      returnTime: "17:00",
      mileageOut: 40120,
      fuelLevelOut: "3/4",
    },
    status: "confirmed",
    paymentStatus: "paid",
    totalAmount: 19500,
    createdAt: "2026-05-04T08:00:00.000Z",
    updatedAt: "2026-05-04T08:00:00.000Z",
  },
  // Record 3: Kevin Mutiso Musyoka - Toyota Axio to Machakos
  {
    id: "booking-hist-3",
    serviceType: "car-rental",
    customerDetails: {
      fullName: "Kevin Mutiso Musyoka",
      email: "kevin.mutiso@gmail.com",
      phone: "+254700112233",
      idNumber: "29887766",
    },
    vehicleDetails: {
      make: "Toyota",
      model: "Axio",
      numberPlate: "KDC 112P",
      rentalType: "self-drive",
    },
    tripDetails: {
      pickupLocation: "Embakasi, Nairobi",
      dropoffLocation: "Machakos",
      pickupDate: "2026-05-02",
      pickupTime: "10:00",
      returnDate: "2026-05-03",
      returnTime: "10:00",
      mileageOut: 67800,
      fuelLevelOut: "1/2",
    },
    status: "completed",
    paymentStatus: "paid",
    totalAmount: 4000,
    createdAt: "2026-05-02T10:00:00.000Z",
    updatedAt: "2026-05-03T10:00:00.000Z",
  },
  // Additional demo bookings for variety
  {
    id: "booking-hist-4",
    serviceType: "car-rental",
    customerDetails: {
      fullName: "Demo Customer 7",
      email: "demo7@example.com",
      phone: "+254700000007",
      idNumber: "20000007",
    },
    vehicleDetails: {
      make: "Toyota",
      model: "Land Cruiser V8",
      numberPlate: "KDE 456X",
      rentalType: "self-drive",
    },
    tripDetails: {
      pickupLocation: "Kisumu",
      dropoffLocation: "Maasai Mara",
      pickupDate: "2026-04-15",
      pickupTime: "06:00",
      returnDate: "2026-04-18",
      returnTime: "18:00",
      mileageOut: 45000,
      fuelLevelOut: "Full",
    },
    status: "completed",
    paymentStatus: "partial",
    totalAmount: 35000,
    createdAt: "2024-11-18T09:00:00.000Z",
    updatedAt: "2024-11-22T18:00:00.000Z",
  },
  // Record 5: Jane Wambui Kamau - Nissan X-Trail to Mombasa
  {
    id: "booking-hist-5",
    serviceType: "car-rental",
    customerDetails: {
      fullName: "Jane Wambui Kamau",
      email: "jane.wambui@gmail.com",
      phone: "+254745678901",
      idNumber: "45678901",
    },
    vehicleDetails: {
      make: "Nissan",
      model: "X-Trail",
      numberPlate: "KDF 789M",
      rentalType: "self-drive",
    },
    tripDetails: {
      pickupLocation: "Westlands, Nairobi",
      dropoffLocation: "Mombasa",
      pickupDate: "2026-04-28",
      pickupTime: "07:00",
      returnDate: "2026-05-01",
      returnTime: "19:00",
      mileageOut: 32500,
      fuelLevelOut: "Full",
    },
    status: "in-progress",
    paymentStatus: "paid",
    totalAmount: 32000,
    createdAt: "2026-04-27T14:00:00.000Z",
    updatedAt: "2026-04-28T07:00:00.000Z",
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
  // Record 11: Samuel Njoroge - Mercedes V-Class (Chauffeur) - Pending
  {
    id: "booking-hist-11",
    serviceType: "car-rental",
    customerDetails: {
      fullName: "Samuel Njoroge Maina",
      email: "samuel.njoroge@company.co.ke",
      phone: "+254756789012",
      idNumber: "56789012",
    },
    vehicleDetails: {
      make: "Mercedes",
      model: "V-Class",
      numberPlate: "KDG 001A",
      rentalType: "chauffeur-driven",
    },
    tripDetails: {
      pickupLocation: "JKIA Airport",
      dropoffLocation: "Serena Hotel, Nairobi",
      pickupDate: "2026-05-10",
      pickupTime: "14:00",
      returnDate: "2026-05-15",
      returnTime: "10:00",
      mileageOut: 15200,
      fuelLevelOut: "Full",
    },
    status: "pending",
    paymentStatus: "pending",
    totalAmount: 75000,
    createdAt: "2026-05-01T10:00:00.000Z",
    updatedAt: "2026-05-01T10:00:00.000Z",
  },
  // Record 12: Lucy Chebet - Subaru Outback - Cancelled
  {
    id: "booking-hist-12",
    serviceType: "car-rental",
    customerDetails: {
      fullName: "Lucy Chebet Kiptoo",
      email: "lucy.chebet@gmail.com",
      phone: "+254767890123",
      idNumber: "67890123",
    },
    vehicleDetails: {
      make: "Subaru",
      model: "Outback",
      numberPlate: "KDH 456B",
      rentalType: "self-drive",
    },
    tripDetails: {
      pickupLocation: "Eldoret",
      dropoffLocation: "Nakuru",
      pickupDate: "2026-04-20",
      pickupTime: "08:00",
      returnDate: "2026-04-22",
      returnTime: "18:00",
    },
    status: "cancelled",
    paymentStatus: "refunded",
    totalAmount: 18000,
    createdAt: "2026-04-15T09:00:00.000Z",
    updatedAt: "2026-04-18T11:00:00.000Z",
  },
  // Record 13: Michael Ochieng - Honda CR-V - In Progress
  {
    id: "booking-hist-13",
    serviceType: "car-rental",
    customerDetails: {
      fullName: "Michael Ochieng Onyango",
      email: "michael.ochieng@outlook.com",
      phone: "+254778901234",
      idNumber: "78901234",
    },
    vehicleDetails: {
      make: "Honda",
      model: "CR-V",
      numberPlate: "KDJ 789C",
      rentalType: "self-drive",
    },
    tripDetails: {
      pickupLocation: "Kisumu",
      dropoffLocation: "Kakamega",
      pickupDate: "2026-05-01",
      pickupTime: "09:00",
      returnDate: "2026-05-05",
      returnTime: "17:00",
      mileageOut: 28400,
      fuelLevelOut: "3/4",
    },
    status: "in-progress",
    paymentStatus: "partial",
    totalAmount: 22000,
    createdAt: "2026-04-29T14:00:00.000Z",
    updatedAt: "2026-05-01T09:00:00.000Z",
  },
  // Record 14: Fatma Hassan - Toyota Hiace (Van) - Confirmed
  {
    id: "booking-hist-14",
    serviceType: "car-rental",
    customerDetails: {
      fullName: "Fatma Hassan Ali",
      email: "fatma.hassan@gmail.com",
      phone: "+254789012345",
      idNumber: "89012345",
    },
    vehicleDetails: {
      make: "Toyota",
      model: "Hiace (14-seater)",
      numberPlate: "KDK 012D",
      rentalType: "chauffeur-driven",
    },
    tripDetails: {
      pickupLocation: "Mombasa CBD",
      dropoffLocation: "Diani Beach",
      pickupDate: "2026-05-08",
      pickupTime: "07:00",
      returnDate: "2026-05-10",
      returnTime: "20:00",
      mileageOut: 42100,
      fuelLevelOut: "Full",
    },
    status: "confirmed",
    paymentStatus: "paid",
    totalAmount: 45000,
    createdAt: "2026-05-02T11:00:00.000Z",
    updatedAt: "2026-05-02T11:00:00.000Z",
  },
  // Record 15: James Kariuki - Range Rover Sport - Completed with debt
  {
    id: "booking-hist-15",
    serviceType: "car-rental",
    customerDetails: {
      fullName: "James Kariuki Ngugi",
      email: "james.kariuki@business.co.ke",
      phone: "+254790123456",
      idNumber: "90123456",
    },
    vehicleDetails: {
      make: "Land Rover",
      model: "Range Rover Sport",
      numberPlate: "KDL 345E",
      rentalType: "self-drive",
    },
    tripDetails: {
      pickupLocation: "Karen, Nairobi",
      dropoffLocation: "Tsavo East",
      pickupDate: "2026-04-10",
      pickupTime: "05:30",
      returnDate: "2026-04-14",
      returnTime: "19:00",
      mileageOut: 8500,
      fuelLevelOut: "Full",
      mileageIn: 9200,
      fuelLevelIn: "1/4",
    },
    status: "completed",
    paymentStatus: "partial",
    totalAmount: 120000,
    createdAt: "2026-04-05T10:00:00.000Z",
    updatedAt: "2026-04-14T19:30:00.000Z",
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
