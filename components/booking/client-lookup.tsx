"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search,
  User,
  Phone,
  Mail,
  MapPin,
  IdCard,
  Fingerprint,
  FileText,
  Building,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Loader2,
  UserPlus,
  UserCheck,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { getClients } from "@/lib/store";
import type { Client } from "@/types";

interface ClientLookupProps {
  onClientSelected: (client: Client) => void;
  onNewClient?: () => void;
  className?: string;
  showNewClientButton?: boolean;
}

interface BlacklistEntry {
  id: string;
  fullName: string;
  idNumber: string;
  phoneNumber: string;
  status: string;
  recordType: string;
  severity: string;
}

export function ClientLookup({
  onClientSelected,
  onNewClient,
  className = "",
  showNewClientButton = true,
}: ClientLookupProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState<"all" | "id" | "phone" | "name" | "license" | "kra" | "fingerprint">("all");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Client[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [blacklistWarning, setBlacklistWarning] = useState<BlacklistEntry | null>(null);

  // Debounced search
  const performSearch = useCallback(() => {
    if (!searchTerm.trim() || searchTerm.length < 2) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    setIsSearching(true);
    setHasSearched(true);

    // Simulate search delay for UX
    setTimeout(() => {
      const clients = getClients();
      const term = searchTerm.toLowerCase().trim();

      const results = clients.filter(client => {
        switch (searchType) {
          case "id":
            return client.idNumber.toLowerCase().includes(term);
          case "phone":
            return client.phone.toLowerCase().includes(term);
          case "name":
            return client.fullName.toLowerCase().includes(term);
          case "license":
            return client.drivingLicenseNumber?.toLowerCase().includes(term);
          case "kra":
            return client.kraPin?.toLowerCase().includes(term);
          case "fingerprint":
            // For demo, just return all clients when fingerprint mode is selected
            return client.leftFingerprint?.includes(term) || client.rightFingerprint?.includes(term);
          case "all":
          default:
            return (
              client.idNumber.toLowerCase().includes(term) ||
              client.phone.toLowerCase().includes(term) ||
              client.fullName.toLowerCase().includes(term) ||
              client.email?.toLowerCase().includes(term) ||
              client.kraPin?.toLowerCase().includes(term) ||
              client.drivingLicenseNumber?.toLowerCase().includes(term)
            );
        }
      });

      setSearchResults(results);
      setIsSearching(false);
    }, 300);
  }, [searchTerm, searchType]);

  useEffect(() => {
    const timer = setTimeout(performSearch, 300);
    return () => clearTimeout(timer);
  }, [performSearch]);

  // Check blacklist when client is selected
  const checkBlacklist = (client: Client): BlacklistEntry | null => {
    try {
      const blacklist: { id: string; fullName: string; idNumber: string; phoneNumber: string; drivingLicenseNumber?: string; recordType: string; severity: string; description: string; incidentDate: string; status?: string; }[] = [];
      const match = blacklist.find(
        entry =>
          entry.idNumber === client.idNumber ||
          entry.phoneNumber === client.phone ||
          (entry.drivingLicenseNumber && entry.drivingLicenseNumber === client.drivingLicenseNumber)
      );
      if (match) {
        return {
          id: match.id,
          fullName: match.fullName,
          idNumber: match.idNumber,
          phoneNumber: match.phoneNumber,
          status: match.status ?? "active",
          recordType: match.recordType,
          severity: match.severity,
        };
      }
    } catch {
      // No blacklist found
    }
    return null;
  };

  // Handle client selection
  const handleSelectClient = (client: Client) => {
    const blacklistEntry = checkBlacklist(client);
    
    if (blacklistEntry && blacklistEntry.status === "active") {
      setBlacklistWarning(blacklistEntry);
      setSelectedClient(client);
      setIsDialogOpen(true);
    } else {
      // Clear and proceed
      setSelectedClient(client);
      onClientSelected(client);
      toast.success(`Client ${client.fullName} selected`);
      setSearchTerm("");
      setSearchResults([]);
      setHasSearched(false);
    }
  };

  // Confirm selection despite warning
  const confirmSelection = () => {
    if (selectedClient) {
      onClientSelected(selectedClient);
      toast.warning(`Client selected with warning - ${blacklistWarning?.recordType}`);
      setIsDialogOpen(false);
      setBlacklistWarning(null);
      setSearchTerm("");
      setSearchResults([]);
      setHasSearched(false);
    }
  };

  // Risk level badge
  const getRiskBadge = (riskLevel: string | undefined) => {
    switch (riskLevel) {
      case "low":
        return <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">Low Risk</Badge>;
      case "medium":
        return <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400">Medium Risk</Badge>;
      case "high":
        return <Badge className="bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400">High Risk</Badge>;
      case "blocked":
        return <Badge className="bg-red-600 text-white">Blocked</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Section */}
      <Card className="border-2 border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
            <UserCheck className="h-5 w-5" />
            Existing Client Lookup
          </CardTitle>
          <CardDescription>
            Search by Name, ID Number, Phone, Driving License, or KRA PIN to auto-fill client details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Type Tabs */}
          <Tabs value={searchType} onValueChange={(v) => setSearchType(v as typeof searchType)}>
            <TabsList className="grid grid-cols-4 sm:grid-cols-7 gap-1">
              <TabsTrigger value="all" className="text-xs px-2">All</TabsTrigger>
              <TabsTrigger value="name" className="text-xs px-2">Name</TabsTrigger>
              <TabsTrigger value="id" className="text-xs px-2">ID No.</TabsTrigger>
              <TabsTrigger value="phone" className="text-xs px-2">Phone</TabsTrigger>
              <TabsTrigger value="license" className="text-xs px-2">License</TabsTrigger>
              <TabsTrigger value="kra" className="text-xs px-2">KRA PIN</TabsTrigger>
              <TabsTrigger value="fingerprint" className="text-xs px-2">
                <Fingerprint className="h-3 w-3" />
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Search Input */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={
                  searchType === "fingerprint"
                    ? "Place finger on scanner..."
                    : searchType === "all"
                    ? "Search by name, ID, phone, KRA PIN..."
                    : `Search by ${searchType}...`
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white dark:bg-gray-900"
              />
              {isSearching && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-emerald-600" />
              )}
            </div>
            {searchType === "fingerprint" && (
              <Button variant="outline" className="gap-2">
                <Fingerprint className="h-4 w-4" />
                Scan
              </Button>
            )}
          </div>

          {/* Search Results */}
          {hasSearched && (
            <div className="space-y-2">
              {searchResults.length === 0 ? (
                <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                  <User className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p>No existing client found</p>
                  {showNewClientButton && (
                    <Button
                      variant="outline"
                      className="mt-3 gap-2"
                      onClick={onNewClient}
                    >
                      <UserPlus className="h-4 w-4" />
                      Register New Client
                    </Button>
                  )}
                </div>
              ) : (
                <>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Found {searchResults.length} client{searchResults.length > 1 ? "s" : ""}
                  </p>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {searchResults.map(client => (
                      <div
                        key={client.id}
                        className="p-4 border rounded-lg bg-white dark:bg-gray-900 hover:border-emerald-400 dark:hover:border-emerald-600 cursor-pointer transition-all"
                        onClick={() => handleSelectClient(client)}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-gray-900 dark:text-white">
                                {client.fullName}
                              </h4>
                              {getRiskBadge(client.riskLevel)}
                            </div>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-gray-600 dark:text-gray-400">
                              <p className="flex items-center gap-1.5">
                                <IdCard className="h-3.5 w-3.5" />
                                {client.idNumber}
                              </p>
                              <p className="flex items-center gap-1.5">
                                <Phone className="h-3.5 w-3.5" />
                                {client.phone}
                              </p>
                              {client.email && (
                                <p className="flex items-center gap-1.5 col-span-2 truncate">
                                  <Mail className="h-3.5 w-3.5" />
                                  {client.email}
                                </p>
                              )}
                              {client.kraPin && (
                                <p className="flex items-center gap-1.5">
                                  <FileText className="h-3.5 w-3.5" />
                                  {client.kraPin}
                                </p>
                              )}
                            </div>
                            {client.totalBookings !== undefined && client.totalBookings > 0 && (
                              <p className="mt-2 text-xs text-emerald-600 dark:text-emerald-400">
                                {client.totalBookings} previous booking{client.totalBookings > 1 ? "s" : ""}
                              </p>
                            )}
                          </div>
                          <Button size="sm" className="shrink-0 gap-1">
                            Select
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Blacklist Warning Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Blacklist Warning
            </DialogTitle>
            <DialogDescription>
              This client has an active blacklist record
            </DialogDescription>
          </DialogHeader>
          {blacklistWarning && (
            <div className="space-y-4">
              <div className="p-4 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-red-700 dark:text-red-400">
                      {blacklistWarning.fullName}
                    </span>
                    <Badge className="bg-red-600 text-white capitalize">
                      {blacklistWarning.recordType}
                    </Badge>
                  </div>
                  <div className="text-sm text-red-600 dark:text-red-300 space-y-1">
                    <p>ID: {blacklistWarning.idNumber}</p>
                    <p>Phone: {blacklistWarning.phoneNumber}</p>
                    <p className="capitalize">Severity: {blacklistWarning.severity}</p>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                This client is flagged in the blacklist system. Proceeding with this booking may pose risks.
                Please consult with management before confirming.
              </p>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              <XCircle className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmSelection}
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Proceed Anyway
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// KRA PIN Auto-fill Hook
export function useKraPinLookup() {
  const [isLooking, setIsLooking] = useState(false);

  const lookupByKraPin = useCallback(async (kraPin: string): Promise<Client | null> => {
    if (!kraPin || kraPin.length < 5) return null;

    setIsLooking(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const clients = getClients();
    const found = clients.find(c => c.kraPin?.toLowerCase() === kraPin.toLowerCase());
    
    setIsLooking(false);
    return found || null;
  }, []);

  return { lookupByKraPin, isLooking };
}

// Export helper to format client for form
export function formatClientForForm(client: Client) {
  return {
    fullName: client.fullName,
    idNumber: client.idNumber,
    phone: client.phone,
    email: client.email || "",
    residence: client.residence || "",
    placeOfWork: client.placeOfWork || "",
    kraPin: client.kraPin || "",
    drivingLicenseNumber: client.drivingLicenseNumber || "",
    nextOfKin: client.nextOfKin || { name: "", phone: "", relationship: "" },
  };
}
