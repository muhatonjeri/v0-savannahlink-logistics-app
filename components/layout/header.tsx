"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { services } from "@/lib/services";

export function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo - Double click for staff login */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/images/logo.png"
            alt="SavannaTrail Logistics & Tours"
            width={180}
            height={60}
            className="h-14 w-auto"
            priority
          />
        </Link>
        {/* Hidden Staff Login - Only visible on hover */}
        <Link 
          href="/auth/login" 
          className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 text-[10px] text-transparent hover:text-muted-foreground/50 transition-colors"
          title="Staff Portal"
        >
          Staff
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="/"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Home
          </Link>

          {/* Services Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                Services
                <ChevronDown className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-56">
              {services.map((service) => (
                <DropdownMenuItem key={service.id} asChild>
                  <Link href={service.href} className="cursor-pointer">
                    {service.name}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Link
            href="/about"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            About
          </Link>

          <Link
            href="/contact"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Contact
          </Link>
        </nav>

        {/* Desktop CTA */}
        <div className="hidden items-center gap-4 md:flex">
          <Button asChild>
            <Link href="/services">Get a Quote</Link>
          </Button>
        </div>

        {/* Mobile Navigation */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[350px]">
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <div className="flex flex-col gap-6 pt-6">
              <Link
                href="/"
                onClick={() => setIsOpen(false)}
                className="text-lg font-medium"
              >
                Home
              </Link>

              <div className="flex flex-col gap-2">
                <span className="text-lg font-medium text-muted-foreground">Services</span>
                <div className="flex flex-col gap-2 pl-4">
                  {services.map((service) => (
                    <Link
                      key={service.id}
                      href={service.href}
                      onClick={() => setIsOpen(false)}
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      {service.name}
                    </Link>
                  ))}
                </div>
              </div>

              <Link
                href="/about"
                onClick={() => setIsOpen(false)}
                className="text-lg font-medium"
              >
                About
              </Link>

              <Link
                href="/contact"
                onClick={() => setIsOpen(false)}
                className="text-lg font-medium"
              >
                Contact
              </Link>

              <div className="flex flex-col gap-3 pt-4 border-t border-border">
                <Button asChild>
                  <Link href="/services" onClick={() => setIsOpen(false)}>
                    Get a Quote
                  </Link>
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
