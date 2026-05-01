"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Car,
  Compass,
  Plane,
  Truck,
  Wrench,
  Package,
  Ship,
  HardHat,
  LayoutDashboard,
  Users,
  ChevronRight,
  LogOut,
  Menu,
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

const navItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: Users,
  },
];

const serviceItems = [
  { title: "Car Rental", href: "/admin/car-rental", icon: Car },
  { title: "Safari Tours", href: "/admin/safari-tours", icon: Compass },
  { title: "Transfers", href: "/admin/transfers", icon: Plane },
  { title: "Movers", href: "/admin/movers", icon: Truck },
  { title: "Road Recovery", href: "/admin/road-recovery", icon: Wrench },
  { title: "Cargo Handling", href: "/admin/cargo-handling", icon: Package },
  { title: "Shipment Imports", href: "/admin/shipment-imports", icon: Ship },
  { title: "Construction Equipment", href: "/admin/construction-equipment", icon: HardHat },
];

function getBreadcrumbTitle(pathname: string): string {
  if (pathname === "/admin") return "Dashboard";
  if (pathname === "/admin/users") return "Users";
  if (pathname.includes("car-rental")) return "Car Rental";
  if (pathname.includes("safari-tours")) return "Safari Tours";
  if (pathname.includes("transfers")) return "Transfers";
  if (pathname.includes("movers")) return "Movers";
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

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="border-b border-sidebar-border p-4">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-sm font-bold text-primary-foreground">SL</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold">Savannah Link</span>
              <span className="text-xs text-muted-foreground">Admin Portal</span>
            </div>
          </Link>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Main</SidebarGroupLabel>
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
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>Services</SidebarGroupLabel>
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
                        <item.icon className="h-4 w-4" />
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
          <Button variant="ghost" className="w-full justify-start gap-2" asChild>
            <Link href="/">
              <LogOut className="h-4 w-4" />
              <span>Exit Admin</span>
            </Link>
          </Button>
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
        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
