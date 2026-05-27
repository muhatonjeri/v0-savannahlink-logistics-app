import mongoose, { Schema } from "mongoose";

// ── CLIENT ────────────────────────────────────────────
const ClientSchema = new Schema({
  fullName:              { type: String, required: true },
  idNumber:              { type: String },
  phone:                 { type: String, required: true },
  alternativePhone:      String,
  email:                 String,
  residence:             String,
  placeOfWork:           String,
  kraPin:                String,
  drivingLicenseNumber:  String,
  passportPhotoUrl:      String,
  idPhotoUrl:            String,
  idPhotoBackUrl:        String,
  drivingLicenseUrl:     String,
  nextOfKin: {
    name:         String,
    phone:        String,
    relationship: String,
  },
  riskLevel:        { type: String, default: "low" },
  clientType:       { type: String, default: "citizen" },
  countryOfOrigin:  { type: String, default: "Kenya" },
  totalBookings:    { type: Number, default: 0 },
  totalSpent:       { type: Number, default: 0 },
  totalDebt:        { type: Number, default: 0 },
  notes:            String,
}, { timestamps: true });

// ── BLACKLIST ─────────────────────────────────────────
const BlacklistSchema = new Schema({
  clientId:     { type: Schema.Types.ObjectId, ref: "Client" },
  clientName:   { type: String, required: true },
  idNumber:     String,
  phone:        String,
  recordType:   { type: String, required: true },
  severity:     { type: String, required: true },
  status:       { type: String, default: "active" },
  incidentDate: Date,
  description:  String,
  reportedBy:   String,
}, { timestamps: true });

// ── BOOKING ───────────────────────────────────────────
const BookingSchema = new Schema({
  bookingRef:      { type: String, unique: true },
  clientId:        { type: Schema.Types.ObjectId, ref: "Client" },
  serviceType:     { type: String, required: true },
  customerName:    { type: String, required: true },
  customerPhone:   { type: String, required: true },
  customerEmail:   String,
  status:          { type: String, default: "pending" },
  paymentStatus:   { type: String, default: "pending" },
  paymentMethod:   String,
  totalAmount:     { type: Number, default: 0 },
  amountPaid:      { type: Number, default: 0 },
  mpesaRef:        String,
  bankRef:         String,
  notes:           String,
  metadata:        Schema.Types.Mixed,
}, { timestamps: true });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(BookingSchema as { pre: Function }).pre("save", function(this: { bookingRef?: string }, next: () => void) {
  if (!this.bookingRef) {
    this.bookingRef = "BK-" + Date.now().toString(36).toUpperCase();
  }
  next();
});

// ── FLEET VEHICLE ─────────────────────────────────────
const FleetVehicleSchema = new Schema({
  vehicleName:       { type: String, required: true },
  vehicleMake:       { type: String, required: true },
  vehicleModel:      { type: String, required: true },
  registrationNo:    { type: String, required: true, unique: true },
  vehicleType:       String,
  fuelType:          String,
  year:              Number,
  color:             String,
  ownershipType:     { type: String, default: "own" },
  supplierName:      String,
  supplierPhone:     String,
  supplierDailyRate: Number,
  ourDailyRate:      Number,
  status:            { type: String, default: "available" },
  currentMileage:    Number,
  lastServiceDate:   Date,
  nextServiceDate:   Date,
  notes:             String,
}, { timestamps: true });

// ── INVOICE ───────────────────────────────────────────
const InvoiceSchema = new Schema({
  invoiceNumber:   { type: String, required: true, unique: true },
  clientId:        { type: Schema.Types.ObjectId, ref: "Client" },
  customerName:    { type: String, required: true },
  customerEmail:   String,
  customerPhone:   String,
  customerAddress: String,
  customerKraPin:  String,
  serviceType:     { type: String, required: true },
  items:           [Schema.Types.Mixed],
  subtotal:        { type: Number, default: 0 },
  vatRate:         { type: Number, default: 16 },
  vatAmount:       { type: Number, default: 0 },
  total:           { type: Number, default: 0 },
  amountPaid:      { type: Number, default: 0 },
  payments:        [Schema.Types.Mixed],
  status:          { type: String, default: "draft" },
  issueDate:       String,
  dueDate:         String,
  paymentTerms:    String,
  notes:           String,
}, { timestamps: true });

// ── RECEIPT ───────────────────────────────────────────
const ReceiptSchema = new Schema({
  receiptNumber:        { type: String, required: true, unique: true },
  invoiceId:            { type: Schema.Types.ObjectId, ref: "Invoice" },
  clientId:             { type: Schema.Types.ObjectId, ref: "Client" },
  customerName:         { type: String, required: true },
  customerPhone:        String,
  customerEmail:        String,
  customerKraPin:       String,
  serviceType:          { type: String, required: true },
  items:                [Schema.Types.Mixed],
  subtotal:             { type: Number, default: 0 },
  taxAmount:            { type: Number, default: 0 },
  totalAmount:          { type: Number, required: true },
  paymentMethod:        { type: String, required: true },
  transactionCode:      String,
  bankName:             String,
  status:               { type: String, default: "issued" },
  etimsReceiptNumber:   String,
  etimsDeviceNumber:    String,
  etimsVerificationUrl: String,
  issuedAt:             { type: Date, default: Date.now },
  issuedBy:             String,
}, { timestamps: true });

// ── TRANSACTION ───────────────────────────────────────
const TransactionSchema = new Schema({
  date:          { type: String, required: true },
  type:          { type: String, required: true, enum: ["income", "expense"] },
  category:      { type: String, required: true },
  subcategory:   String,
  description:   { type: String, required: true },
  amount:        { type: Number, required: true },
  paymentMethod: String,
  reference:     String,
  customerName:  String,
  invoiceNumber: String,
  status:        { type: String, default: "completed" },
  createdBy:     String,
  linkedSubletId: String,
}, { timestamps: true });

// ── SUBLET VEHICLE ────────────────────────────────────
const SubletVehicleSchema = new Schema({
  serviceType:       { type: String, required: true },
  supplierName:      { type: String, required: true },
  supplierPhone:     String,
  supplierEmail:     String,
  supplierType:      { type: String, default: "company" },
  make:              { type: String, required: true },
  model:             { type: String, required: true },
  registration:      { type: String, required: true },
  color:             String,
  year:              String,
  supplierDailyRate: { type: Number, required: true },
  ourDailyRate:      { type: Number, required: true },
  status:            { type: String, default: "available" },
}, { timestamps: true });

// ── SUBLET BOOKING ────────────────────────────────────
const SubletBookingSchema = new Schema({
  vehicleId:          { type: Schema.Types.ObjectId, ref: "SubletVehicle" },
  clientId:           { type: Schema.Types.ObjectId, ref: "Client" },
  serviceType:        { type: String, required: true },
  areaOfUse:          String,
  clientName:         { type: String, required: true },
  clientPhone:        String,
  startDate:          String,
  endDate:            String,
  numberOfDays:       Number,
  supplierDailyRate:  Number,
  ourDailyRate:       Number,
  totalSupplierCost:  Number,
  totalClientCharge:  Number,
  expenses:           [Schema.Types.Mixed],
  totalExpenses:      { type: Number, default: 0 },
  netProfit:          Number,
  profitPerDay:       Number,
  status:             { type: String, default: "active" },
  paymentMethod:      String,
  paymentReference:   String,
  amountPaid:         { type: Number, default: 0 },
  notes:              String,
}, { timestamps: true });

// ── FLEET OUT ─────────────────────────────────────────
const FleetOutSchema = new Schema({
  vehicleMake:      String,
  vehicleModel:     String,
  vehicleReg:       { type: String, required: true },
  vehicleColor:     String,
  receiverName:     { type: String, required: true },
  receiverPhone:    String,
  receiverEmail:    String,
  receiverType:     { type: String, default: "company" },
  ourDailyRate:     { type: Number, required: true },
  startDate:        String,
  endDate:          String,
  numberOfDays:     Number,
  paymentMethod:    String,
  paymentReference: String,
  amountPaid:       { type: Number, default: 0 },
  status:           { type: String, default: "active" },
  returnCondition:  String,
  followUpNotes:    String,
  notes:            String,
}, { timestamps: true });

// ── STAFF ─────────────────────────────────────────────
const StaffSchema = new Schema({
  fullName:   { type: String, required: true },
  email:      { type: String, required: true, unique: true },
  phone:      String,
  role:       { type: String, default: "staff" },
  department: String,
  isActive:   { type: Boolean, default: true },
}, { timestamps: true });

// Export models (prevent recompilation in dev)
export const Client       = mongoose.models.Client       || mongoose.model("Client",       ClientSchema);
export const Blacklist    = mongoose.models.Blacklist    || mongoose.model("Blacklist",    BlacklistSchema);
export const Booking      = mongoose.models.Booking      || mongoose.model("Booking",      BookingSchema);
export const FleetVehicle = mongoose.models.FleetVehicle || mongoose.model("FleetVehicle", FleetVehicleSchema);
export const Invoice      = mongoose.models.Invoice      || mongoose.model("Invoice",      InvoiceSchema);
export const Receipt      = mongoose.models.Receipt      || mongoose.model("Receipt",      ReceiptSchema);
export const Transaction  = mongoose.models.Transaction  || mongoose.model("Transaction",  TransactionSchema);
export const SubletVehicle  = mongoose.models.SubletVehicle  || mongoose.model("SubletVehicle",  SubletVehicleSchema);
export const SubletBooking  = mongoose.models.SubletBooking  || mongoose.model("SubletBooking",  SubletBookingSchema);
export const FleetOut     = mongoose.models.FleetOut     || mongoose.model("FleetOut",     FleetOutSchema);
export const Staff        = mongoose.models.Staff        || mongoose.model("Staff",        StaffSchema);
