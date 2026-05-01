// Service Types
export type ServiceType =
  | "car-rental"
  | "safari-tours"
  | "hotel-airport-transfers"
  | "movers"
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
export interface MoversBooking extends BaseBooking {
  serviceType: "movers";
  moveType: "residential" | "commercial" | "office";
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
  | RoadRecoveryBooking
  | CargoBooking
  | ShipmentBooking
  | ConstructionEquipmentBooking;

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
