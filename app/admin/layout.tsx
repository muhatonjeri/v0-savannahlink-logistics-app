"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";


import {
  Car,
  Compass,
  Plane,
  Truck,
  Bus,
  Wrench,
  Package,
  Ship,
  HardHat,
  LogOut,
  User as UserIcon,
  Gauge,
  UsersRound,
  Fingerprint,
  ShieldX,
  Truck as FleetIcon,
  ReceiptText,
  BadgeDollarSign,
  FileBadge,
  Sliders,
  Anchor,
  HardHat as ConstructionIcon,
} from "lucide-react";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// Mock auth type
interface MockAuth {
  user: {
    email: string;
    role: string;
    name: string;
  };
  isAuthenticated: boolean;
}

const navItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: Gauge,
    color: "text-sky-400",
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: UsersRound,
    color: "text-lime-400",
  },
  {
    title: "Client Lookup",
    href: "/admin/client-lookup",
    icon: Fingerprint,
    color: "text-violet-400",
  },
  {
    title: "Blacklist",
    href: "/admin/blacklist",
    icon: ShieldX,
    color: "text-rose-500",
  },
  {
    title: "Fleet Management",
    href: "/admin/fleet",
    icon: Truck,
    color: "text-fuchsia-400",
  },
  {
    title: "Receipts",
    href: "/admin/receipts",
    icon: ReceiptText,
    color: "text-teal-400",
  },
  {
    title: "Accounts",
    href: "/admin/accounts",
    icon: BadgeDollarSign,
    color: "text-yellow-400",
  },
  {
    title: "Invoices",
    href: "/admin/invoices",
    icon: FileBadge,
    color: "text-orange-400",
  },
  {
    title: "Services Config",
    href: "/admin/services",
    icon: Sliders,
    color: "text-pink-400",
  },
];

const serviceItems = [
  { title: "Car Rental", href: "/admin/client-lookup?service=car-rental", icon: Car, color: "text-emerald-500" },
  { title: "Safari Tours", href: "/admin/client-lookup?service=safari-tours", icon: Compass, color: "text-amber-500" },
  { title: "Transfers", href: "/admin/client-lookup?service=transfers", icon: Plane, color: "text-sky-500" },
  { title: "Movers", href: "/admin/client-lookup?service=movers", icon: Package, color: "text-violet-500" },
  { title: "Corporate Rental", href: "/admin/client-lookup?service=corporate-rental", icon: Bus, color: "text-indigo-500" },
  { title: "Road Recovery", href: "/admin/client-lookup?service=road-recovery", icon: Wrench, color: "text-rose-500" },
  { title: "Cargo Handling", href: "/admin/client-lookup?service=cargo-handling", icon: Anchor, color: "text-orange-500" },
  { title: "Shipment Imports", href: "/admin/client-lookup?service=shipment-imports", icon: Ship, color: "text-cyan-500" },
  { title: "Construction Equipment", href: "/admin/client-lookup?service=construction-equipment", icon: HardHat, color: "text-yellow-500" },
];

function getBreadcrumbTitle(pathname: string): string {
  if (pathname === "/admin") return "Dashboard";
  if (pathname === "/admin/users") return "Users";
  if (pathname.includes("client-lookup")) return "Client Lookup";
  if (pathname.includes("blacklist")) return "Blacklist";
  if (pathname.includes("fleet")) return "Fleet Management";
  if (pathname.includes("receipts")) return "Receipts";
  if (pathname.includes("accounts")) return "Accounts";
  if (pathname.includes("invoices")) return "Invoices";
  if (pathname.includes("services")) return "Services Config";
  if (pathname.includes("car-rental")) return "Car Rental";
  if (pathname.includes("safari-tours")) return "Safari Tours";
  if (pathname.includes("transfers")) return "Transfers";
  if (pathname.includes("movers")) return "Movers";
  if (pathname.includes("corporate-rental")) return "Corporate Rental";
  if (pathname.includes("road-recovery")) return "Road Recovery";
  if (pathname.includes("cargo-handling")) return "Cargo Handling";
  if (pathname.includes("shipment-imports")) return "Shipment Imports";
  if (pathname.includes("construction-equipment")) return "Construction Equipment";
  return "Admin";
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const handleSignOut = () => {
    localStorage.removeItem('mockAuth');
    document.cookie = 'mock_auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    window.location.href = '/';
  };

  const getCurrentEmail = () => "admin@moventrasafarislogisticsltd.com";
  const getUserInitials = () => "AD";
  const getUserRole = () => "Admin";

  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar>
        <SidebarHeader className="border-b border-sidebar-border p-4">
          <Link href="/admin" className="flex items-center gap-2">
            <Image
              src="/images/logo.png"
              alt="Moventra Safaris & Logistics Ltd"
              width={140}
              height={47}
              className="h-10 w-auto"
            />
          </Link>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="text-blue-400 font-bold uppercase tracking-widest text-xs">Main</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.href}
                      tooltip={item.title}
                    >
                      <Link href={item.href}>
                        <item.icon className="h-4 w-4 shrink-0" style={{color: ({"text-blue-500":"#3b82f6","text-green-500":"#22c55e","text-indigo-500":"#6366f1","text-red-500":"#ef4444","text-purple-500":"#a855f7","text-emerald-500":"#10b981","text-amber-500":"#f59e0b","text-cyan-500":"#06b6d4","text-gray-500":"#6b7280","text-sky-500":"#0ea5e9","text-violet-500":"#8b5cf6","text-rose-500":"#f43f5e","text-orange-500":"#f97316","text-yellow-500":"#eab308"})[item.color] || "white"}} />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel className="text-[#e67e22] font-bold uppercase tracking-widest text-xs">Services</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {serviceItems.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname.startsWith(item.href)}
                      tooltip={item.title}
                    >
                      <Link href={item.href}>
                        <item.icon className="h-4 w-4 shrink-0" style={{color: ({"text-blue-500":"#3b82f6","text-green-500":"#22c55e","text-indigo-500":"#6366f1","text-red-500":"#ef4444","text-purple-500":"#a855f7","text-emerald-500":"#10b981","text-amber-500":"#f59e0b","text-cyan-500":"#06b6d4","text-gray-500":"#6b7280","text-sky-500":"#0ea5e9","text-violet-500":"#8b5cf6","text-rose-500":"#f43f5e","text-orange-500":"#f97316","text-yellow-500":"#eab308"})[item.color] || "white"}} />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="border-t border-sidebar-border p-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start gap-2 px-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start text-left">
                  <span className="text-sm font-medium truncate max-w-[140px]">
                    {getCurrentEmail()}
                  </span>
                  <span className="text-xs text-muted-foreground">{getUserRole()}</span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled>
                <UserIcon className="mr-2 h-4 w-4" />
                Profile Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/">
                  <LogOut className="mr-2 h-4 w-4" />
                  Exit to Website
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="flex h-14 items-center gap-4 border-b bg-background px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
              </BreadcrumbItem>
              {pathname !== "/admin" && (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>{getBreadcrumbTitle(pathname)}</BreadcrumbPage>
                  </BreadcrumbItem>
                </>
              )}
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-6 relative">
          {/* Watermark Logo */}
          <div className="fixed bottom-4 right-4 pointer-events-none z-0 opacity-[0.03] print:hidden">
            <Image
              src="/images/logo.png"
              alt=""
              width={300}
              height={150}
              className="h-auto w-[200px] md:w-[300px] object-contain"
              unoptimized
            />
          </div>
          <div className="relative z-10">{children}</div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
