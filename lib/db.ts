"use client";

import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

// =====================================================
// CLIENTS
// =====================================================
export const clientsDb = {
  async getAll() {
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data;
  },

  async search(query: string) {
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .or(`full_name.ilike.%${query}%,phone.ilike.%${query}%,id_number.ilike.%${query}%`)
      .limit(10);
    if (error) throw error;
    return data;
  },

  async create(client: Record<string, unknown>) {
    const { data, error } = await supabase
      .from("clients")
      .insert([client])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Record<string, unknown>) {
    const { data, error } = await supabase
      .from("clients")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase.from("clients").delete().eq("id", id);
    if (error) throw error;
  },
};

// =====================================================
// BLACKLIST
// =====================================================
export const blacklistDb = {
  async getAll() {
    const { data, error } = await supabase
      .from("blacklist")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },

  async checkClient(query: string) {
    const { data, error } = await supabase
      .from("blacklist")
      .select("*")
      .or(`client_name.ilike.%${query}%,id_number.ilike.%${query}%,phone.ilike.%${query}%`)
      .eq("status", "active");
    if (error) throw error;
    return data;
  },

  async create(entry: Record<string, unknown>) {
    const { data, error } = await supabase
      .from("blacklist")
      .insert([entry])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Record<string, unknown>) {
    const { data, error } = await supabase
      .from("blacklist")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};

// =====================================================
// BOOKINGS
// =====================================================
export const bookingsDb = {
  async getAll() {
    const { data, error } = await supabase
      .from("bookings")
      .select("*, clients(*)")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },

  async getByService(serviceType: string) {
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("service_type", serviceType)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },

  async getByClient(clientId: string) {
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },

  async create(booking: Record<string, unknown>) {
    const { data, error } = await supabase
      .from("bookings")
      .insert([booking])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Record<string, unknown>) {
    const { data, error } = await supabase
      .from("bookings")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getStats() {
    const { data, error } = await supabase.from("bookings").select("status, total_amount, service_type");
    if (error) throw error;
    return data;
  },
};

// =====================================================
// FLEET
// =====================================================
export const fleetDb = {
  async getAll() {
    const { data, error } = await supabase
      .from("fleet_vehicles")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from("fleet_vehicles")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data;
  },

  async create(vehicle: Record<string, unknown>) {
    const { data, error } = await supabase
      .from("fleet_vehicles")
      .insert([vehicle])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Record<string, unknown>) {
    const { data, error } = await supabase
      .from("fleet_vehicles")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase.from("fleet_vehicles").delete().eq("id", id);
    if (error) throw error;
  },
};

// =====================================================
// INVOICES
// =====================================================
export const invoicesDb = {
  async getAll() {
    const { data, error } = await supabase
      .from("invoices")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from("invoices")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data;
  },

  async create(invoice: Record<string, unknown>) {
    const { data, error } = await supabase
      .from("invoices")
      .insert([invoice])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Record<string, unknown>) {
    const { data, error } = await supabase
      .from("invoices")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase.from("invoices").delete().eq("id", id);
    if (error) throw error;
  },
};

// =====================================================
// RECEIPTS
// =====================================================
export const receiptsDb = {
  async getAll() {
    const { data, error } = await supabase
      .from("receipts")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },

  async create(receipt: Record<string, unknown>) {
    const { data, error } = await supabase
      .from("receipts")
      .insert([receipt])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Record<string, unknown>) {
    const { data, error } = await supabase
      .from("receipts")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};

// =====================================================
// ACCOUNTS / TRANSACTIONS
// =====================================================
export const transactionsDb = {
  async getAll(filters?: { type?: string; from?: string; to?: string }) {
    let query = supabase.from("transactions").select("*").order("date", { ascending: false });
    if (filters?.type) query = query.eq("type", filters.type);
    if (filters?.from) query = query.gte("date", filters.from);
    if (filters?.to) query = query.lte("date", filters.to);
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async create(transaction: Record<string, unknown>) {
    const { data, error } = await supabase
      .from("transactions")
      .insert([transaction])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async createBatch(transactions: Record<string, unknown>[]) {
    const { data, error } = await supabase
      .from("transactions")
      .insert(transactions)
      .select();
    if (error) throw error;
    return data;
  },

  async getSummary() {
    const { data, error } = await supabase
      .from("transactions")
      .select("type, amount, status");
    if (error) throw error;
    return data;
  },
};

// =====================================================
// SUBLET ASSETS
// =====================================================
export const subletDb = {
  async getVehicles() {
    const { data, error } = await supabase
      .from("sublet_vehicles")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },

  async createVehicle(vehicle: Record<string, unknown>) {
    const { data, error } = await supabase
      .from("sublet_vehicles")
      .insert([vehicle])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getBookings() {
    const { data, error } = await supabase
      .from("sublet_bookings")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },

  async createBooking(booking: Record<string, unknown>) {
    const { data, error } = await supabase
      .from("sublet_bookings")
      .insert([booking])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateVehicleStatus(id: string, status: string) {
    const { error } = await supabase
      .from("sublet_vehicles")
      .update({ status })
      .eq("id", id);
    if (error) throw error;
  },
};

// =====================================================
// FLEET OUT
// =====================================================
export const fleetOutDb = {
  async getAll() {
    const { data, error } = await supabase
      .from("fleet_out")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },

  async create(record: Record<string, unknown>) {
    const { data, error } = await supabase
      .from("fleet_out")
      .insert([record])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Record<string, unknown>) {
    const { data, error } = await supabase
      .from("fleet_out")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};

// =====================================================
// STAFF / USERS
// =====================================================
export const staffDb = {
  async getAll() {
    const { data, error } = await supabase
      .from("staff")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },

  async create(member: Record<string, unknown>) {
    const { data, error } = await supabase
      .from("staff")
      .insert([member])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Record<string, unknown>) {
    const { data, error } = await supabase
      .from("staff")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};

// =====================================================
// FILE UPLOAD (Supabase Storage)
// =====================================================
export const storageDb = {
  async upload(bucket: string, path: string, file: File) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, { upsert: true });
    if (error) throw error;
    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(data.path);
    return publicUrl;
  },

  async delete(bucket: string, path: string) {
    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) throw error;
  },
};
