import Link from "next/link";
import Image from "next/image";
import { Mail, Phone, MapPin, Globe, Facebook, Instagram, Twitter, Youtube } from "lucide-react";
import { services } from "@/lib/services";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Company Info */}
          <div className="flex flex-col gap-4">
            <Image
              src="/images/logo.png"
              alt="SavannaTrail Logistics & Tours"
              width={200}
              height={120}
              className="h-auto w-[180px] object-contain"
              quality={100}
              unoptimized
            />
            <p className="text-sm text-muted-foreground">
              Your trusted partner for logistics, transportation, and tour services across Kenya and beyond. Journeys that connect.
            </p>
            {/* Social Media Icons */}
            <div className="flex items-center gap-3">
              <a
                href="https://facebook.com/savannatrail"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="https://instagram.com/savannatrail"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="https://twitter.com/savannatrail"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                aria-label="Twitter"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href="https://youtube.com/@savannatrail"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                aria-label="YouTube"
              >
                <Youtube className="h-4 w-4" />
              </a>
            </div>
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
                  href="mailto:info@savannatrail.co.ke"
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  info@savannatrail.co.ke
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
                  href="https://www.savannatrail.co.ke"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  www.savannatrail.co.ke
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} SavannaTrail Logistics & Tours. All rights reserved.
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
