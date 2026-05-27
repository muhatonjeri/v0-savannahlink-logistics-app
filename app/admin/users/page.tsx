"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, User, Shield, UserCog,
  UsersRound,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field";
import { toast } from "sonner";
import type { AdminUser, UserRole } from "@/types";


const DEMO_USERS: AdminUser[] = [
  { id: "usr-001", name: "Moventra Admin",       email: "admin@moventrasafarislogisticsltd.com", role: "admin", phone: "+254727247032", department: "Management", isActive: true, createdAt: "2024-01-01" },
  { id: "usr-002", name: "Operations Manager",   email: "ops@moventrasafarislogisticsltd.com",   role: "admin", phone: "+254722000001", department: "Operations", isActive: true, createdAt: "2024-01-15" },
  { id: "usr-003", name: "Booking Agent 1",       email: "agent1@moventrasafarislogisticsltd.com",role: "staff", phone: "+254733000002", department: "Bookings",   isActive: true, createdAt: "2024-02-01" },
  { id: "usr-004", name: "Booking Agent 2",       email: "agent2@moventrasafarislogisticsltd.com",role: "staff", phone: "+254744000003", department: "Bookings",   isActive: true, createdAt: "2024-02-15" },
  { id: "usr-005", name: "Fleet Manager",         email: "fleet@moventrasafarislogisticsltd.com", role: "staff", phone: "+254755000004", department: "Fleet",      isActive: true, createdAt: "2024-03-01" },
];

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>(DEMO_USERS);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [formData, setFormData] = useState({ name: "", email: "", role: "staff" as UserRole });

  useEffect(() => {
    fetch("/api/staff")
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setUsers(data.map((u: Record<string,unknown>) => ({
            id: String(u.id || ""), name: String(u.full_name || u.name || ""),
            email: String(u.email || ""), phone: String(u.phone || ""),
            role: String(u.role || "staff") as "admin" | "staff", department: String(u.department || ""),
            isActive: u.is_active !== false, createdAt: String(u.created_at || ""),
          })));
        }
        // If API returns empty/error: DEMO_USERS remain visible
      })
      .catch(() => {}); // Silently keep demo data
  }, []);

  const handleSubmit = () => {
    if (!formData.name || !formData.email) {
      toast.error("Please fill in all fields");
      return;
    }

    const user: AdminUser = editingUser
      ? { ...editingUser, name: formData.name, email: formData.email, role: formData.role }
      : {
          id: crypto.randomUUID(),
          name: formData.name,
          email: formData.email,
          role: formData.role,
          createdAt: new Date().toISOString(),
        };

    const method = editingUser ? "PUT" : "POST";
    const body = editingUser
      ? { id: editingUser.id, full_name: user.name, email: user.email, role: user.role }
      : { full_name: user.name, email: user.email, role: user.role };
    fetch("/api/staff", {
      method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
    }).then(() => fetch("/api/staff").then(r => r.json())).then(data => {
      if (Array.isArray(data)) setUsers(data.map((u: Record<string,unknown>) => ({
        id: String(u.id || ""), name: String(u.full_name || u.name || ""),
        email: String(u.email || ""), phone: String(u.phone || ""),
        role: String(u.role || "staff") as "admin" | "staff", department: String(u.department || ""),
        isActive: u.is_active !== false, createdAt: String(u.created_at || ""),
      })));
    }).catch(e => console.error("Save user:", e));
    setIsDialogOpen(false);
    setEditingUser(null);
    setFormData({ name: "", email: "", role: "staff" });
    toast.success(editingUser ? "User updated successfully" : "User added successfully");
  };

  const handleEdit = (user: AdminUser) => {
    setEditingUser(user);
    setFormData({ name: user.name, email: user.email, role: user.role });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (users.length <= 1) {
      toast.error("Cannot delete the last user");
      return;
    }
    fetch("/api/staff?id=" + id, { method: "DELETE" })
      .then(() => fetch("/api/staff").then(r => r.json())).then(data => {
      if (Array.isArray(data)) setUsers(data.map((u: Record<string,unknown>) => ({
        id: String(u.id || ""), name: String(u.full_name || u.name || ""),
        email: String(u.email || ""), phone: String(u.phone || ""),
        role: String(u.role || "staff") as "admin" | "staff", department: String(u.department || ""),
        isActive: u.is_active !== false, createdAt: String(u.created_at || ""),
      })));
    }).catch(e => console.error("Load users:", e)).finally(() => setLoading(false));
    toast.success("User deleted");
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setEditingUser(null);
      setFormData({ name: "", email: "", role: "staff" });
    }
    setIsDialogOpen(open);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><UsersRound className="h-6 w-6 text-lime-400" />Users</h1>
          <p className="text-muted-foreground">Manage admin and staff accounts</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingUser ? "Edit User" : "Add New User"}</DialogTitle>
              <DialogDescription>
                {editingUser
                  ? "Update the user&apos;s information below."
                  : "Create a new admin or staff account."}
              </DialogDescription>
            </DialogHeader>
            <FieldGroup className="gap-4">
              <Field>
                <FieldLabel>Full Name</FieldLabel>
                <Input
                  placeholder="John Kamau"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </Field>
              <Field>
                <FieldLabel>Email Address</FieldLabel>
                <Input
                  type="email"
                  placeholder="john@Moventra Safaris & Logistics Ltd.co.ke"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </Field>
              <Field>
                <FieldLabel>Role</FieldLabel>
                <Select
                  value={formData.role}
                  onValueChange={(value: UserRole) => setFormData({ ...formData, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </FieldGroup>
            <DialogFooter>
              <Button variant="outline" onClick={() => handleDialogClose(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>{editingUser ? "Save Changes" : "Add User"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center gap-4 pb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardDescription>Total Users</CardDescription>
              <CardTitle className="text-2xl">{users.length}</CardTitle>
            </div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center gap-4 pb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardDescription>Admins</CardDescription>
              <CardTitle className="text-2xl">
                {users.filter((u) => u.role === "admin").length}
              </CardTitle>
            </div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center gap-4 pb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <UserCog className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardDescription>Staff</CardDescription>
              <CardTitle className="text-2xl">
                {users.filter((u) => u.role === "staff").length}
              </CardTitle>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>View and manage all user accounts</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="overflow-x-auto">
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(user)}>
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(user.id)}
                        disabled={users.length <= 1}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
            </div>
            </CardContent>
      </Card>
    </div>
  );
}
