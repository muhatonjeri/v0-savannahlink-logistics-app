"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
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
  LayoutDashboard,
  Users,
  LogOut,
  User as UserIcon,
  ShieldAlert,
  Truck as FleetIcon,
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
    icon: LayoutDashboard,
    color: "text-blue-500",
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: Users,
    color: "text-green-500",
  },
  {
    title: "Blacklist",
    href: "/admin/blacklist",
    icon: ShieldAlert,
    color: "text-red-500",
  },
  {
    title: "Fleet Management",
    href: "/admin/fleet",
    icon: FleetIcon,
    color: "text-purple-500",
  },
];

const serviceItems = [
  { title: "Car Rental", href: "/admin/car-rental", icon: Car, color: "text-emerald-500" },
  { title: "Safari Tours", href: "/admin/safari-tours", icon: Compass, color: "text-amber-500" },
  { title: "Transfers", href: "/admin/transfers", icon: Plane, color: "text-sky-500" },
  { title: "Movers", href: "/admin/movers", icon: Truck, color: "text-violet-500" },
  { title: "Corporate Rental", href: "/admin/corporate-rental", icon: Bus, color: "text-indigo-500" },
  { title: "Road Recovery", href: "/admin/road-recovery", icon: Wrench, color: "text-rose-500" },
  { title: "Cargo Handling", href: "/admin/cargo-handling", icon: Package, color: "text-orange-500" },
  { title: "Shipment Imports", href: "/admin/shipment-imports", icon: Ship, color: "text-cyan-500" },
  { title: "Construction Equipment", href: "/admin/construction-equipment", icon: HardHat, color: "text-yellow-500" },
];

function getBreadcrumbTitle(pathname: string): string {
  if (pathname === "/admin") return "Dashboard";
  if (pathname === "/admin/users") return "Users";
  if (pathname.includes("blacklist")) return "Blacklist";
  if (pathname.includes("fleet")) return "Fleet Management";
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
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [mockAuth, setMockAuth] = useState<MockAuth | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for mock auth first
    const mockAuthData = localStorage.getItem('mockAuth');
    if (mockAuthData) {
      try {
        const parsed = JSON.parse(mockAuthData) as MockAuth;
        if (parsed.isAuthenticated) {
          setMockAuth(parsed);
          setIsLoading(false);
          return;
        }
      } catch {
        localStorage.removeItem('mockAuth');
      }
    }

    // Fall back to Supabase auth
    const supabase = createClient();
    
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setIsLoading(false);
      
      // If no user and no mock auth, redirect to login
      if (!user && !mockAuthData) {
        router.push('/auth/login?redirect=' + encodeURIComponent(pathname));
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [pathname, router]);

  const handleSignOut = async () => {
    // Clear mock auth cookie and localStorage
    document.cookie = 'mock_auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    localStorage.removeItem('mockAuth');
    setMockAuth(null);
    
    // Also sign out from Supabase
    const supabase = createClient();
    await supabase.auth.signOut();
    
    router.push("/");
    router.refresh();
  };

  const getCurrentEmail = () => {
    if (mockAuth) return mockAuth.user.email;
    return user?.email || "User";
  };

  const getUserInitials = () => {
    const email = getCurrentEmail();
    return email.substring(0, 2).toUpperCase();
  };

  const getUserRole = () => {
    if (mockAuth) {
      return mockAuth.user.role === "admin" ? "Admin" : "Staff";
    }
    const role = user?.user_metadata?.role;
    if (role === "admin") return "Admin";
    return "Staff";
  };

  // Redirect if not authenticated
  if (!isLoading && !user && !mockAuth) {
    router.push('/auth/login?redirect=' + encodeURIComponent(pathname));
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="border-b border-sidebar-border p-4">
          <Link href="/admin" className="flex items-center gap-2">
            <Image
              src="/images/logo.png"
              alt="SavannaTrail"
              width={140}
              height={47}
              className="h-10 w-auto"
            />
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
                        <item.icon className={`h-4 w-4 ${item.color}`} />
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
        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
