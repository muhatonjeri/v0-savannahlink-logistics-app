import Link from "next/link";
import { Mail, Phone, MapPin, Globe } from "lucide-react";
import { services } from "@/lib/services";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Company Info */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <span className="text-lg font-bold text-primary-foreground">SL</span>
              </div>
              <div>
                <span className="text-lg font-bold text-foreground">Savannah Link</span>
                <span className="block text-xs text-muted-foreground">Logistics & Tours</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Your trusted partner for logistics, transportation, and tour services across Kenya and beyond.
            </p>
          </div>

          {/* Services */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-foreground">Our Services</h3>
            <ul className="flex flex-col gap-2">
              {services.slice(0, 6).map((service) => (
                <li key={service.id}>
                  <Link
                    href={service.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-foreground">Quick Links</h3>
            <ul className="flex flex-col gap-2">
              <li>
                <Link
                  href="/about"
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/services"
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  All Services
                </Link>
              </li>
              <li>
                <Link
                  href="/admin"
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  Admin Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-foreground">Contact Us</h3>
            <ul className="flex flex-col gap-3">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span className="text-sm text-muted-foreground">
                  Muthaiga Square, off Thika Rd
                  <br />
                  Nairobi, Kenya
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-primary" />
                <a
                  href="mailto:info@savannahlink.co.ke"
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  info@savannahlink.co.ke
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-primary" />
                <a
                  href="tel:+254700000000"
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  +254 700 000 000
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Globe className="h-4 w-4 shrink-0 text-primary" />
                <a
                  href="https://www.savanalink.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  www.savanalink.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Savannah Link Logistics & Tours. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link
              href="/privacy"
              className="text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
