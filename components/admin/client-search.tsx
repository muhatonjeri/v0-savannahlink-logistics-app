"use client";

import { useState, useEffect } from "react";
import { Search, User, Phone, Mail, IdCard, UserCheck, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { searchClients, getClients } from "@/lib/store";
import type { Client } from "@/types";

interface ClientSearchProps {
  onClientSelect: (client: Client) => void;
  onNewClient: () => void;
}

export function ClientSearch({ onClientSelect, onNewClient }: ClientSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Client[]>([]);
  const [recentClients, setRecentClients] = useState<Client[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Load recent clients on mount
  useEffect(() => {
    const clients = getClients();
    // Sort by updatedAt and get top 5
    const sorted = clients.sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    ).slice(0, 5);
    setRecentClients(sorted);
  }, []);

  // Search as user types
  useEffect(() => {
    if (searchQuery.length >= 2) {
      setIsSearching(true);
      const results = searchClients(searchQuery);
      setSearchResults(results);
      setIsSearching(false);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const handleSelectClient = (client: Client) => {
    onClientSelect(client);
  };

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCheck className="h-5 w-5 text-primary" />
          Returning Client?
        </CardTitle>
        <CardDescription>
          Search for an existing client to auto-fill their details
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, phone, ID number, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Search Results */}
        {searchQuery.length >= 2 && (
          <div className="space-y-2">
            {isSearching ? (
              <p className="text-sm text-muted-foreground">Searching...</p>
            ) : searchResults.length > 0 ? (
              <>
                <p className="text-xs font-medium text-muted-foreground">
                  Found {searchResults.length} client(s)
                </p>
                <div className="max-h-60 space-y-2 overflow-y-auto">
                  {searchResults.map((client) => (
                    <ClientCard
                      key={client.id}
                      client={client}
                      onSelect={handleSelectClient}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="rounded-lg border border-dashed p-4 text-center">
                <p className="text-sm text-muted-foreground">
                  No clients found matching &quot;{searchQuery}&quot;
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={onNewClient}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Register New Client
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Recent Clients */}
        {searchQuery.length < 2 && recentClients.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">
              Recent Clients
            </p>
            <div className="max-h-60 space-y-2 overflow-y-auto">
              {recentClients.map((client) => (
                <ClientCard
                  key={client.id}
                  client={client}
                  onSelect={handleSelectClient}
                />
              ))}
            </div>
          </div>
        )}

        <Separator />

        {/* New Client Button */}
        <Button
          variant="outline"
          className="w-full"
          onClick={onNewClient}
        >
          <Plus className="mr-2 h-4 w-4" />
          Register New Client
        </Button>
      </CardContent>
    </Card>
  );
}

// Client Card Component
function ClientCard({
  client,
  onSelect,
}: {
  client: Client;
  onSelect: (client: Client) => void;
}) {
  return (
    <div
      className="flex cursor-pointer items-start justify-between rounded-lg border bg-card p-3 transition-colors hover:bg-muted/50"
      onClick={() => onSelect(client)}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          <User className="h-5 w-5 text-primary" />
        </div>
        <div className="space-y-1">
          <p className="font-medium leading-none">{client.fullName}</p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Phone className="h-3 w-3" />
              {client.phone}
            </span>
            <span className="flex items-center gap-1">
              <IdCard className="h-3 w-3" />
              {client.idNumber}
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Mail className="h-3 w-3" />
            {client.email}
          </div>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1">
        <Badge variant="secondary" className="text-xs">
          {client.totalBookings} booking{client.totalBookings !== 1 ? "s" : ""}
        </Badge>
        {client.fingerprintLeftUrl && client.fingerprintRightUrl && (
          <Badge variant="outline" className="text-xs text-green-600">
            Verified
          </Badge>
        )}
      </div>
    </div>
  );
}
