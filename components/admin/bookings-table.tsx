"use client";
import type { PaymentStatus } from "@/types";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, MoreHorizontal, CheckCircle, XCircle, Clock, Trash2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { updateBookingStatus, deleteBooking } from "@/lib/store";
import { toast } from "sonner";
import type { Booking, BookingStatus } from "@/types";

interface BookingsTableProps {
  bookings: Booking[];
  onRefresh: () => void;
  showService?: boolean;
}

const statusColors: Record<BookingStatus, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "outline",
  confirmed: "secondary",
  "in-progress": "default",
  completed: "default",
  cancelled: "destructive",
};

const paymentStatusColors: Record<PaymentStatus, string> = {
  pending: "outline",
  processing: "secondary",
  completed: "default",
  failed: "destructive",
  paid: "default",
  partial: "secondary",
  unpaid: "outline",
  refunded: "outline",
};

export function BookingsTable({ bookings, onRefresh, showService = false }: BookingsTableProps) {
  const router = useRouter();
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleStatusChange = (id: string, status: BookingStatus) => {
    updateBookingStatus(id, status);
    onRefresh();
    toast.success(`Booking status updated to ${status}`);
  };

  const handleDelete = (id: string) => {
    deleteBooking(id);
    onRefresh();
    toast.success("Booking deleted");
  };

  const handleView = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsDialogOpen(true);
  };

  if (bookings.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-lg border border-dashed">
        <p className="text-muted-foreground">No bookings found</p>
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Customer</TableHead>
            {showService && <TableHead>Service</TableHead>}
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bookings.map((booking) => (
            <TableRow key={booking.id}>
              <TableCell className="font-mono text-xs">
                {booking.id.substring(0, 8)}
              </TableCell>
              <TableCell>
                <div>
                  <p className="font-medium">{booking.customerName}</p>
                  <p className="text-xs text-muted-foreground">{booking.customerPhone}</p>
                </div>
              </TableCell>
              {showService && (
                <TableCell className="capitalize">
                  {booking.serviceType.replace(/-/g, " ")}
                </TableCell>
              )}
              <TableCell>KES {booking.totalAmount.toLocaleString()}</TableCell>
              <TableCell>
                <Badge variant={statusColors[booking.status]}>{booking.status}</Badge>
              </TableCell>
              <TableCell>
                <Badge variant={paymentStatusColors[booking.paymentStatus] as "default" | "secondary" | "destructive" | "outline"}>
                  {booking.paymentStatus}
                </Badge>
              </TableCell>
              <TableCell>{new Date(booking.createdAt).toLocaleDateString()}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Actions</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => handleView(booking)}>
                      <Eye className="mr-2 h-4 w-4" />
                      Quick View
                    </DropdownMenuItem>
                    {booking.serviceType === "car-rental" && (
                      <DropdownMenuItem onClick={() => router.push(`/admin/car-rental/${booking.id}`)}>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Full Details & Print
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => handleStatusChange(booking.id, "confirmed")}>
                      <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                      Confirm
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange(booking.id, "in-progress")}>
                      <Clock className="mr-2 h-4 w-4 text-blue-600" />
                      In Progress
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange(booking.id, "completed")}>
                      <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                      Complete
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange(booking.id, "cancelled")}>
                      <XCircle className="mr-2 h-4 w-4 text-red-600" />
                      Cancel
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleDelete(booking.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
            <DialogDescription>
              ID: {selectedBooking?.id.substring(0, 12)}
            </DialogDescription>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Customer</p>
                  <p>{selectedBooking.customerName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Phone</p>
                  <p>{selectedBooking.customerPhone}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p>{selectedBooking.customerEmail}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Service</p>
                  <p className="capitalize">{selectedBooking.serviceType.replace(/-/g, " ")}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <Badge variant={statusColors[selectedBooking.status]}>
                    {selectedBooking.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Payment</p>
                  <Badge variant={paymentStatusColors[selectedBooking.paymentStatus] as "default" | "secondary" | "destructive" | "outline"}>
                    {selectedBooking.paymentStatus}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Amount</p>
                  <p className="text-lg font-semibold text-primary">
                    KES {selectedBooking.totalAmount.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Created</p>
                  <p>{new Date(selectedBooking.createdAt).toLocaleString()}</p>
                </div>
              </div>

              {/* Service-specific details */}
              <div className="rounded-lg bg-muted/50 p-4">
                <p className="mb-2 text-sm font-medium">Service Details</p>
                <pre className="overflow-x-auto whitespace-pre-wrap text-xs">
                  {JSON.stringify(selectedBooking, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
