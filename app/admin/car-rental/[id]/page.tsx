"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Printer,
  User,
  Car,
  Calendar,
  CreditCard,
  Phone,
  Mail,
  MapPin,
  Fingerprint,
  FileText,
  Clock,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getBookingById } from "@/lib/store";
import type { CarRentalBooking, BookingStatus } from "@/types";

const statusColors: Record<BookingStatus, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "outline",
  confirmed: "secondary",
  "in-progress": "default",
  completed: "default",
  cancelled: "destructive",
};

const paymentStatusColors = {
  pending: "outline",
  processing: "secondary",
  completed: "default",
  failed: "destructive",
};

export default function CarRentalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const printRef = useRef<HTMLDivElement>(null);
  const [booking, setBooking] = useState<CarRentalBooking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = params.id as string;
    const found = getBookingById(id);
    if (found && found.serviceType === "car-rental") {
      setBooking(found as CarRentalBooking);
    }
    setLoading(false);
  }, [params.id]);

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Car Rental Booking - ${booking?.id}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              padding: 20px;
              color: #1a1a1a;
              line-height: 1.6;
            }
            .header {
              text-align: center;
              border-bottom: 3px solid #E86A33;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .header h1 {
              font-size: 28px;
              color: #0A1628;
              margin-bottom: 5px;
            }
            .header p {
              color: #666;
              font-size: 14px;
            }
            .booking-id {
              background: #f5f5f5;
              padding: 10px 20px;
              border-radius: 8px;
              display: inline-block;
              margin-top: 10px;
              font-family: monospace;
              font-size: 12px;
            }
            .section {
              margin-bottom: 25px;
              page-break-inside: avoid;
            }
            .section-title {
              font-size: 16px;
              font-weight: 600;
              color: #0A1628;
              border-bottom: 2px solid #E86A33;
              padding-bottom: 8px;
              margin-bottom: 15px;
              display: flex;
              align-items: center;
              gap: 8px;
            }
            .grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 15px;
            }
            .grid-3 {
              grid-template-columns: repeat(3, 1fr);
            }
            .field {
              margin-bottom: 10px;
            }
            .field-label {
              font-size: 11px;
              color: #666;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-bottom: 3px;
            }
            .field-value {
              font-size: 14px;
              font-weight: 500;
            }
            .status-badge {
              display: inline-block;
              padding: 4px 12px;
              border-radius: 20px;
              font-size: 12px;
              font-weight: 600;
              text-transform: capitalize;
            }
            .status-pending { background: #fef3c7; color: #92400e; }
            .status-confirmed { background: #d1fae5; color: #065f46; }
            .status-in-progress { background: #dbeafe; color: #1e40af; }
            .status-completed { background: #d1fae5; color: #065f46; }
            .status-cancelled { background: #fee2e2; color: #991b1b; }
            .payment-completed { background: #d1fae5; color: #065f46; }
            .payment-pending { background: #fef3c7; color: #92400e; }
            .payment-failed { background: #fee2e2; color: #991b1b; }
            .fingerprint-section {
              display: flex;
              gap: 30px;
              justify-content: center;
              margin-top: 20px;
            }
            .fingerprint-box {
              text-align: center;
              border: 2px solid #e5e7eb;
              border-radius: 12px;
              padding: 15px;
              width: 200px;
            }
            .fingerprint-box img {
              width: 150px;
              height: 150px;
              object-fit: cover;
              border-radius: 8px;
              border: 1px solid #e5e7eb;
            }
            .fingerprint-box .placeholder {
              width: 150px;
              height: 150px;
              background: #f3f4f6;
              border-radius: 8px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: #9ca3af;
              font-size: 12px;
            }
            .fingerprint-label {
              margin-top: 10px;
              font-weight: 600;
              color: #374151;
            }
            .document-images {
              display: flex;
              gap: 20px;
              flex-wrap: wrap;
              margin-top: 15px;
            }
            .document-box {
              text-align: center;
              border: 1px solid #e5e7eb;
              border-radius: 8px;
              padding: 10px;
            }
            .document-box img {
              max-width: 180px;
              max-height: 120px;
              object-fit: cover;
              border-radius: 4px;
            }
            .document-label {
              margin-top: 8px;
              font-size: 12px;
              color: #666;
            }
            .total-amount {
              font-size: 24px;
              font-weight: 700;
              color: #E86A33;
            }
            .signature-section {
              margin-top: 50px;
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 50px;
            }
            .signature-box {
              border-top: 2px solid #1a1a1a;
              padding-top: 10px;
              text-align: center;
            }
            .signature-label {
              font-size: 12px;
              color: #666;
            }
            .footer {
              margin-top: 40px;
              text-align: center;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              font-size: 12px;
              color: #666;
            }
            .company-stamp {
              width: 120px;
              height: 120px;
              border: 2px dashed #ccc;
              border-radius: 50%;
              margin: 20px auto;
              display: flex;
              align-items: center;
              justify-content: center;
              color: #999;
              font-size: 11px;
            }
            @media print {
              body { padding: 0; }
              .no-print { display: none !important; }
              @page { margin: 15mm; }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Booking Not Found</h1>
        </div>
        <Card>
          <CardContent className="flex h-40 items-center justify-center">
            <p className="text-muted-foreground">
              The booking you are looking for does not exist or has been deleted.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const personal = booking.personalDetails;
  const car = booking.carDetails;
  const rental = booking.rentalPeriod;

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/car-rental">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Booking Details</h1>
            <p className="font-mono text-sm text-muted-foreground">ID: {booking.id}</p>
          </div>
        </div>
        <Button onClick={handlePrint} className="gap-2">
          <Printer className="h-4 w-4" />
          Print Document
        </Button>
      </div>

      {/* Printable Content */}
      <div ref={printRef}>
        {/* Print Header */}
        <div className="header hidden print:block">
          <h1>Moventra Safaris & Logistics Ltd LOGISTICS & TOURS</h1>
          <p>Muthaiga Square, Thika Superhighway, Nairobi, Kenya</p>
          <p>Tel: +254 700 000 000 | Email: info@moventrasafarislogisticsltd.com</p>
          <p style={{fontStyle: 'italic', marginTop: '5px'}}>Journeys That Connect.</p>
          <div className="booking-id">
            BOOKING ID: {booking.id} | DATE: {new Date(booking.createdAt).toLocaleDateString()}
          </div>
        </div>

        {/* Status Cards */}
        <div className="mb-6 grid gap-4 sm:grid-cols-4 print:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Booking Status</CardDescription>
              <Badge
                variant={statusColors[booking.status]}
                className="w-fit text-sm capitalize"
              >
                {booking.status}
              </Badge>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Payment Status</CardDescription>
              <Badge
                variant={paymentStatusColors[booking.paymentStatus] as "default" | "secondary" | "destructive" | "outline"}
                className="w-fit text-sm capitalize"
              >
                {booking.paymentStatus}
              </Badge>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Rental Type</CardDescription>
              <CardTitle className="text-lg capitalize">{booking.rentalType}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Amount</CardDescription>
              <CardTitle className="text-xl text-primary">
                KES {booking.totalAmount.toLocaleString()}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Personal Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5 text-primary" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3 print:grid-cols-3">
              <div>
                <p className="text-xs font-medium uppercase text-muted-foreground">Full Name</p>
                <p className="font-medium">{personal?.fullName || booking.customerName}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase text-muted-foreground">ID Number</p>
                <p className="font-medium">{personal?.idNumber || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase text-muted-foreground">KRA PIN</p>
                <p className="font-medium">{personal?.kraPin || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase text-muted-foreground">Phone Number</p>
                <p className="flex items-center gap-1 font-medium">
                  <Phone className="h-3 w-3" />
                  {personal?.phone || booking.customerPhone}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase text-muted-foreground">Alternative Phone</p>
                <p className="font-medium">{personal?.alternativePhone || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase text-muted-foreground">Email</p>
                <p className="flex items-center gap-1 font-medium">
                  <Mail className="h-3 w-3" />
                  {booking.customerEmail}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase text-muted-foreground">Driving License No.</p>
                <p className="font-medium">{personal?.drivingLicenseNumber || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase text-muted-foreground">Place of Work</p>
                <p className="font-medium">{personal?.placeOfWork || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase text-muted-foreground">Residence</p>
                <p className="flex items-center gap-1 font-medium">
                  <MapPin className="h-3 w-3" />
                  {personal?.residence || "N/A"}
                </p>
              </div>
            </div>

            {/* Next of Kin */}
            {personal?.nextOfKin && (
              <>
                <Separator />
                <div>
                  <p className="mb-3 flex items-center gap-2 text-sm font-semibold">
                    <Users className="h-4 w-4 text-primary" />
                    Next of Kin
                  </p>
                  <div className="grid gap-4 sm:grid-cols-3 print:grid-cols-3">
                    <div>
                      <p className="text-xs font-medium uppercase text-muted-foreground">Name</p>
                      <p className="font-medium">{personal.nextOfKin.name}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase text-muted-foreground">Phone</p>
                      <p className="font-medium">{personal.nextOfKin.phone}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase text-muted-foreground">Relationship</p>
                      <p className="font-medium capitalize">{personal.nextOfKin.relationship}</p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Document Images */}
            {(personal?.idPhotoUrl || personal?.drivingLicenseUrl || personal?.passportPhotoUrl) && (
              <>
                <Separator />
                <div>
                  <p className="mb-3 flex items-center gap-2 text-sm font-semibold">
                    <FileText className="h-4 w-4 text-primary" />
                    Document Photos
                  </p>
                  <div className="flex flex-wrap gap-4">
                    {personal?.passportPhotoUrl && (
                      <div className="text-center">
                        <div className="relative h-32 w-28 overflow-hidden rounded-lg border">
                          <Image
                            src={personal.passportPhotoUrl}
                            alt="Passport Photo"
                            fill
                            className="object-cover"
                          />
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground">Passport Photo</p>
                      </div>
                    )}
                    {personal?.idPhotoUrl && (
                      <div className="text-center">
                        <div className="relative h-24 w-40 overflow-hidden rounded-lg border">
                          <Image
                            src={personal.idPhotoUrl}
                            alt="ID Card"
                            fill
                            className="object-cover"
                          />
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground">ID Card</p>
                      </div>
                    )}
                    {personal?.drivingLicenseUrl && (
                      <div className="text-center">
                        <div className="relative h-24 w-40 overflow-hidden rounded-lg border">
                          <Image
                            src={personal.drivingLicenseUrl}
                            alt="Driving License"
                            fill
                            className="object-cover"
                          />
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground">Driving License</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Fingerprints Section */}
        {(personal?.fingerprintLeftUrl || personal?.fingerprintRightUrl) && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Fingerprint className="h-5 w-5 text-primary" />
                Fingerprint Verification
              </CardTitle>
              <CardDescription>Captured fingerprints for identity verification</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap justify-center gap-8">
                <div className="text-center">
                  <div className="relative mx-auto h-40 w-40 overflow-hidden rounded-xl border-2 border-dashed border-muted-foreground/30 bg-muted/20">
                    {personal?.fingerprintLeftUrl ? (
                      <Image
                        src={personal.fingerprintLeftUrl}
                        alt="Left Thumb Fingerprint"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Fingerprint className="h-16 w-16 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>
                  <p className="mt-3 font-semibold">Left Thumb</p>
                  <p className="text-xs text-muted-foreground">
                    {personal?.fingerprintLeftUrl ? "Captured" : "Not captured"}
                  </p>
                </div>
                <div className="text-center">
                  <div className="relative mx-auto h-40 w-40 overflow-hidden rounded-xl border-2 border-dashed border-muted-foreground/30 bg-muted/20">
                    {personal?.fingerprintRightUrl ? (
                      <Image
                        src={personal.fingerprintRightUrl}
                        alt="Right Thumb Fingerprint"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Fingerprint className="h-16 w-16 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>
                  <p className="mt-3 font-semibold">Right Thumb</p>
                  <p className="text-xs text-muted-foreground">
                    {personal?.fingerprintRightUrl ? "Captured" : "Not captured"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Vehicle Details */}
        {car && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Car className="h-5 w-5 text-primary" />
                Vehicle Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3 print:grid-cols-3">
                <div>
                  <p className="text-xs font-medium uppercase text-muted-foreground">Make</p>
                  <p className="font-medium">{car.make}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase text-muted-foreground">Model</p>
                  <p className="font-medium">{car.model}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase text-muted-foreground">Number Plate</p>
                  <p className="font-mono font-semibold">{car.numberPlate}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase text-muted-foreground">Current Mileage</p>
                  <p className="font-medium">{car.currentMileage?.toLocaleString() || 0} km</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase text-muted-foreground">Fuel Level</p>
                  <p className="font-medium capitalize">{car.fuelLevel || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase text-muted-foreground">ETC Amount</p>
                  <p className="font-medium">KES {car.etcAmount?.toLocaleString() || 0}</p>
                </div>
                <div className="sm:col-span-3 print:col-span-3">
                  <p className="text-xs font-medium uppercase text-muted-foreground">Destination</p>
                  <p className="font-medium">{car.destination || "N/A"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Rental Period */}
        {rental && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="h-5 w-5 text-primary" />
                Rental Period
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 print:grid-cols-2">
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    Pick-up
                  </p>
                  <p className="text-lg font-semibold">
                    {rental.startDate ? new Date(rental.startDate).toLocaleDateString("en-KE", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }) : "N/A"}
                  </p>
                  <p className="text-muted-foreground">at {rental.startTime || "N/A"}</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    Return
                  </p>
                  <p className="text-lg font-semibold">
                    {rental.endDate ? new Date(rental.endDate).toLocaleDateString("en-KE", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }) : "N/A"}
                  </p>
                  <p className="text-muted-foreground">at {rental.endTime || "N/A"}</p>
                </div>
              </div>
              <Separator className="my-4" />
              <div className="grid gap-4 sm:grid-cols-3 print:grid-cols-3">
                <div>
                  <p className="text-xs font-medium uppercase text-muted-foreground">Number of Days</p>
                  <p className="text-xl font-bold">{rental.numberOfDays || 0}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase text-muted-foreground">Daily Rate</p>
                  <p className="text-xl font-bold">KES {rental.dailyRate?.toLocaleString() || 0}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase text-muted-foreground">Total Amount</p>
                  <p className="text-2xl font-bold text-primary">
                    KES {booking.totalAmount.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payment Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CreditCard className="h-5 w-5 text-primary" />
              Payment Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3 print:grid-cols-3">
              <div>
                <p className="text-xs font-medium uppercase text-muted-foreground">Payment Method</p>
                <p className="font-medium capitalize">{booking.paymentMethod || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase text-muted-foreground">Payment Status</p>
                <Badge
                  variant={paymentStatusColors[booking.paymentStatus] as "default" | "secondary" | "destructive" | "outline"}
                  className="capitalize"
                >
                  {booking.paymentStatus}
                </Badge>
              </div>
              <div>
                <p className="text-xs font-medium uppercase text-muted-foreground">Amount Paid</p>
                <p className="text-xl font-bold text-primary">
                  KES {booking.paymentStatus === "completed" ? booking.totalAmount.toLocaleString() : "0"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Signature Section - Print Only */}
        <div className="mt-12 hidden print:block">
          <div className="grid grid-cols-2 gap-12">
            <div>
              <div className="mb-2 h-16 border-b-2 border-foreground"></div>
              <p className="text-center text-sm text-muted-foreground">Customer Signature</p>
              <p className="text-center text-xs text-muted-foreground">
                ({personal?.fullName || booking.customerName})
              </p>
            </div>
            <div>
              <div className="mb-2 h-16 border-b-2 border-foreground"></div>
              <p className="text-center text-sm text-muted-foreground">Authorized Officer</p>
              <p className="text-center text-xs text-muted-foreground">(Moventra Safaris & Logistics Ltd)</p>
            </div>
          </div>
          <div className="mt-8 flex justify-center">
            <div className="flex h-28 w-28 items-center justify-center rounded-full border-2 border-dashed border-muted-foreground/50">
              <p className="text-center text-xs text-muted-foreground">Company<br />Stamp</p>
            </div>
          </div>
          <div className="mt-8 border-t pt-4 text-center text-xs text-muted-foreground">
            <p>Moventra Safaris & Logistics Ltd Logistics & Tours | Muthaiga Square, Thika Superhighway, Nairobi</p>
            <p>Tel: +254 700 000 000 | Email: info@moventrasafarislogisticsltd.com</p>
            <p className="italic">Journeys That Connect.</p>
            <p className="mt-2">Document generated on {new Date().toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Booking Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Booking Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Calendar className="h-4 w-4" />
              </div>
              <div>
                <p className="font-medium">Booking Created</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(booking.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
            {booking.updatedAt !== booking.createdAt && (
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                  <Clock className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium">Last Updated</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(booking.updatedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
