// Service Types
export type ServiceType =
  | "car-rental"
  | "safari-tours"
  | "hotel-airport-transfers"
  | "movers"
  | "corporate-rental"
  | "road-recovery"
  | "cargo-handling"
  | "shipment-imports"
  | "construction-equipment";

export interface Service {
  id: ServiceType;
  name: string;
  description: string;
  icon: string;
  href: string;
  color: string;
  image: string;
}

// Booking Types
export type BookingStatus = "pending" | "confirmed" | "in-progress" | "completed" | "cancelled";
export type PaymentStatus = "pending" | "processing" | "completed" | "failed";
export type PaymentMethod = "mpesa" | "bank";

export interface BaseBooking {
  id: string;
  serviceType: ServiceType;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

// Car Rental Specific Types
export interface CarRentalBooking extends BaseBooking {
  serviceType: "car-rental";
  rentalType: "self-drive" | "chauffeured";
  personalDetails: {
    fullName: string;
    idNumber: string;
    idPhotoUrl?: string;
    drivingLicenseNumber: string;
    drivingLicenseUrl?: string;
    placeOfWork: string;
    kraPin: string;
    residence: string;
    phone: string;
    alternativePhone?: string;
    nextOfKin: {
      name: string;
      phone: string;
      relationship: string;
    };
    fingerprintLeftUrl?: string;
    fingerprintRightUrl?: string;
    passportPhotoUrl?: string;
  };
  carDetails: {
    make: string;
    model: string;
    numberPlate: string;
    currentMileage: number;
    fuelLevel: string;
    etcAmount: number;
    destination: string;
  };
  rentalPeriod: {
    numberOfDays: number;
    dailyRate: number;
    startDate: string;
    startTime: string;
    endDate: string;
    endTime: string;
  };
}

// Safari Tour Types
export interface SafariTourBooking extends BaseBooking {
  serviceType: "safari-tours";
  packageName: string;
  destination: string;
  numberOfGuests: number;
  startDate: string;
  endDate: string;
  specialRequests?: string;
}

// Hotel/Airport Transfer Types
export interface TransferBooking extends BaseBooking {
  serviceType: "hotel-airport-transfers";
  transferType: "airport-pickup" | "airport-dropoff" | "hotel-transfer";
  pickupLocation: string;
  dropoffLocation: string;
  flightNumber?: string;
  flightTime?: string;
  numberOfPassengers: number;
  luggageCount: number;
  pickupDate: string;
  pickupTime: string;
}

// Movers Types
export type MoversVehicleType = 
  | "small-pickup" 
  | "large-pickup" 
  | "1-ton-truck" 
  | "3-ton-truck" 
  | "5-ton-truck" 
  | "7-ton-truck" 
  | "10-ton-truck";

export interface MoversBooking extends BaseBooking {
  serviceType: "movers";
  moveType: "residential" | "commercial" | "office";
  vehicleType: MoversVehicleType;
  originAddress: string;
  destinationAddress: string;
  moveDate: string;
  inventoryList: string;
  requiresPacking: boolean;
  floorAccess: {
    origin: "ground" | "stairs" | "elevator";
    destination: "ground" | "stairs" | "elevator";
  };
}

// Corporate Rental Types
export interface CorporateRentalBooking extends BaseBooking {
  serviceType: "corporate-rental";
  vehicleType: "10-seater-van" | "14-seater-van" | "22-seater-bus" | "33-seater-bus" | "45-seater-bus" | "52-seater-bus";
  rentalType: "with-driver" | "self-drive";
  companyName?: string;
  pickupLocation: string;
  dropoffLocation: string;
  tripType: "one-way" | "round-trip" | "multi-day";
  startDate: string;
  startTime: string;
  endDate?: string;
  endTime?: string;
  numberOfPassengers: number;
  purpose: string;
  specialRequests?: string;
}

// Road Recovery Types
export interface RoadRecoveryBooking extends BaseBooking {
  serviceType: "road-recovery";
  vehicleType: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleColor: string;
  numberPlate: string;
  currentLocation: string;
  issueDescription: string;
  isBlocking: boolean;
}

// Cargo Handling Types
export interface CargoBooking extends BaseBooking {
  serviceType: "cargo-handling";
  cargoType: string;
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  originPort: string;
  destinationPort: string;
  requiresRefrigeration: boolean;
  hazardous: boolean;
  pickupDate: string;
}

// Shipment/Imports Types
export interface ShipmentBooking extends BaseBooking {
  serviceType: "shipment-imports";
  originCountry: string;
  shipmentType: "air" | "sea" | "road";
  cargoDescription: string;
  estimatedWeight: number;
  customsInfo: {
    hsCode?: string;
    declaredValue: number;
    currency: string;
  };
  deliveryAddress: string;
  expectedArrival: string;
}

// Construction Equipment Types
export interface ConstructionEquipmentBooking extends BaseBooking {
  serviceType: "construction-equipment";
  equipmentType: string;
  quantity: number;
  deliverySite: string;
  rentalStartDate: string;
  rentalEndDate: string;
  operatorRequired: boolean;
  projectDescription?: string;
}

// Union type for all bookings
export type Booking =
  | CarRentalBooking
  | SafariTourBooking
  | TransferBooking
  | MoversBooking
  | CorporateRentalBooking
  | RoadRecoveryBooking
  | CargoBooking
  | ShipmentBooking
  | ConstructionEquipmentBooking;

// Client Alert Types
export type ClientAlertType = "debt" | "damage" | "late-return" | "fraud" | "blacklisted" | "warning";

export interface ClientAlert {
  id: string;
  type: ClientAlertType;
  title: string;
  description: string;
  amount?: number; // For debt alerts
  date: string;
  resolved: boolean;
  resolvedDate?: string;
  resolvedBy?: string;
}

// Client Types (for returning customers)
export interface Client {
  id: string;
  fullName: string;
  idNumber: string;
  idPhotoUrl?: string;
  drivingLicenseNumber?: string;
  drivingLicenseUrl?: string;
  placeOfWork?: string;
  kraPin?: string;
  residence?: string;
  phone: string;
  alternativePhone?: string;
  email?: string;
  nextOfKin?: {
    name: string;
    phone: string;
    relationship: string;
  };
  fingerprintLeftUrl?: string;
  fingerprintRightUrl?: string;
  // Fingerprint data strings (for biometric systems)
  leftFingerprint?: string;
  rightFingerprint?: string;
  passportPhotoUrl?: string;
  totalBookings: number;
  // Alert & Risk fields
  alerts?: ClientAlert[];
  riskLevel?: "low" | "medium" | "high" | "blocked";
  totalDebt?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Admin User Types
export type UserRole = "admin" | "staff";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

// Payment Types
export interface MpesaPayment {
  id: string;
  bookingId: string;
  phoneNumber: string;
  amount: number;
  merchantRequestId: string;
  checkoutRequestId: string;
  responseCode: string;
  responseDescription: string;
  customerMessage: string;
  status: PaymentStatus;
  createdAt: string;
  completedAt?: string;
}

// File Upload Types
export interface FileUpload {
  id: string;
  bookingId: string;
  fileType: "id-photo" | "driving-license" | "fingerprint-left" | "fingerprint-right" | "passport-photo" | "other";
  fileName: string;
  fileUrl: string;
  mimeType: string;
  size: number;
  createdAt: string;
}

// Rogue Client Types (Industry-wide blacklist)
export type RogueClientSeverity = "warning" | "high-risk" | "blacklisted" | "fraud";

export interface RogueClient {
  id: string;
  fullName: string;
  idNumber: string;
  phone?: string;
  alternativePhone?: string;
  email?: string;
  photoUrl?: string;
  severity: RogueClientSeverity;
  reason: string;
  incidents: RogueIncident[];
  reportedBy: string; // Company that reported
  reportedAt: string;
  lastUpdated: string;
  isActive: boolean; // Can be deactivated if resolved
}

export interface RogueIncident {
  id: string;
  date: string;
  type: "theft" | "damage" | "fraud" | "non-payment" | "accident" | "assault" | "other";
  description: string;
  amountOwed?: number;
  reportedBy: string;
  vehicleInvolved?: string;
}
