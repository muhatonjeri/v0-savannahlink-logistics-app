import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Shield,
  Users,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ServiceCard } from "@/components/services/service-card";
import { services } from "@/lib/services";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 sm:py-28 lg:py-32">
          {/* Background Images Slideshow */}
          <div className="absolute inset-0">
            {/* Safari Background */}
            <div className="absolute inset-0 animate-[fadeInOut_20s_ease-in-out_infinite]">
              <Image
                src="/images/hero-safari.jpg"
                alt="Safari adventure"
                fill
                className="object-cover"
                priority
              />
            </div>
            {/* SUV Background */}
            <div className="absolute inset-0 animate-[fadeInOut_20s_ease-in-out_infinite_4s]">
              <Image
                src="/images/hero-suv.jpg"
                alt="Luxury SUV rental"
                fill
                className="object-cover"
              />
            </div>
            {/* Cargo Background */}
            <div className="absolute inset-0 animate-[fadeInOut_20s_ease-in-out_infinite_8s]">
              <Image
                src="/images/hero-cargo.jpg"
                alt="Cargo transport"
                fill
                className="object-cover"
              />
            </div>
            {/* Shipment Background */}
            <div className="absolute inset-0 animate-[fadeInOut_20s_ease-in-out_infinite_12s]">
              <Image
                src="/images/hero-shipment.jpg"
                alt="Shipment imports"
                fill
                className="object-cover"
              />
            </div>
            {/* Recovery Background */}
            <div className="absolute inset-0 animate-[fadeInOut_20s_ease-in-out_infinite_16s]">
              <Image
                src="/images/hero-recovery.jpg"
                alt="Road recovery"
                fill
                className="object-cover"
              />
            </div>
            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-background/80 backdrop-blur-[2px]" />
          </div>

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm text-primary">
                <MapPin className="h-4 w-4" />
                <span>Serving Kenya & East Africa</span>
              </div>
              <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl text-balance">
                <span className="text-primary">Moventra Safaris & Logistics Ltd</span>
              </h1>
              <p className="mb-2 text-xl font-semibold text-foreground/80 sm:text-2xl">
                Logistics & Tours
              </p>
              <p className="mb-6 text-lg italic text-muted-foreground">
                Journeys That Connect.
              </p>
              <p className="mb-8 text-lg text-muted-foreground sm:text-xl text-pretty">
                From car rentals to safari adventures, airport transfers to cargo handling — 
                Moventra Safaris & Logistics Ltd is your trusted partner for all logistics and transportation needs across Kenya. Journeys that connect.
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button size="lg" className="gap-2" asChild>
                  <Link href="/services">
                    Explore Services
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/contact">Contact Us</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="relative py-16 sm:py-20 overflow-hidden">
          {/* African Pattern Background */}
          <div className="absolute inset-0">
            <Image
              src="/images/african-pattern-bg.jpg"
              alt=""
              fill
              className="object-cover opacity-10"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
          </div>
          {/* Decorative African Elements */}
          <div className="absolute left-0 top-0 h-32 w-32 opacity-20">
            <svg viewBox="0 0 100 100" className="h-full w-full text-primary">
              <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2" />
              <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="2" />
              <circle cx="50" cy="50" r="25" fill="none" stroke="currentColor" strokeWidth="2" />
              <path d="M50 5 L50 95 M5 50 L95 50" stroke="currentColor" strokeWidth="1" />
            </svg>
          </div>
          <div className="absolute right-0 bottom-0 h-40 w-40 opacity-20">
            <svg viewBox="0 0 100 100" className="h-full w-full text-primary">
              <polygon points="50,5 95,75 5,75" fill="none" stroke="currentColor" strokeWidth="2" />
              <polygon points="50,25 80,65 20,65" fill="none" stroke="currentColor" strokeWidth="2" />
              <polygon points="50,40 65,60 35,60" fill="none" stroke="currentColor" strokeWidth="2" />
            </svg>
          </div>
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
                Our Services
              </h2>
              <p className="mx-auto max-w-2xl text-muted-foreground">
                Comprehensive logistics and tour solutions tailored to meet your needs. 
                Professional service, competitive rates, and reliable delivery every time.
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {services.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          </div>
        </section>


        {/* Why Choose Us Section */}
        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              <div>
                <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
                  Why Choose Moventra Safaris & Logistics Ltd?
                </h2>
                <p className="mb-8 text-muted-foreground">
                  With years of experience in Kenya&apos;s logistics and tourism industry, 
                  we&apos;ve built a reputation for excellence, reliability, and customer satisfaction.
                </p>
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Shield className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Trusted & Reliable</h3>
                      <p className="text-sm text-muted-foreground">
                        Licensed and insured services with a proven track record.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">24/7 Support</h3>
                      <p className="text-sm text-muted-foreground">
                        Round-the-clock assistance for emergencies and inquiries.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Expert Team</h3>
                      <p className="text-sm text-muted-foreground">
                        Experienced drivers, guides, and logistics professionals.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Best Rates</h3>
                      <p className="text-sm text-muted-foreground">
                        Competitive pricing without compromising on quality.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              {/* Stats Card */}
              <div className="relative rounded-2xl border border-border bg-card p-8">
                <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-primary/10 blur-2xl" />
                <div className="relative grid gap-8 sm:grid-cols-2">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary">500+</div>
                    <div className="mt-1 text-sm text-muted-foreground">Happy Customers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary">50+</div>
                    <div className="mt-1 text-sm text-muted-foreground">Vehicles in Fleet</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary">8</div>
                    <div className="mt-1 text-sm text-muted-foreground">Service Categories</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary">10+</div>
                    <div className="mt-1 text-sm text-muted-foreground">Years Experience</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-primary py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="mb-4 text-3xl font-bold text-primary-foreground sm:text-4xl">
                Ready to Get Started?
              </h2>
              <p className="mx-auto mb-8 max-w-2xl text-primary-foreground/80">
                Whether you need a car for your trip, a safari adventure, or reliable cargo transport — 
                we&apos;re here to help. Get in touch today for a free quote.
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button
                  size="lg"
                  variant="secondary"
                  className="gap-2 bg-white text-primary hover:bg-white/90"
                  asChild
                >
                  <Link href="/services">
                    Book a Service
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/30 bg-transparent text-white hover:bg-white/10"
                  asChild
                >
                  <Link href="tel:+254700000000">
                    <Phone className="mr-2 h-4 w-4" />
                    Call Us Now
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Info Section */}
        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
                Get In Touch
              </h2>
              <p className="mx-auto max-w-2xl text-muted-foreground">
                Have questions or ready to book? Reach out to us through any of these channels.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {/* Office Location */}
              <div className="flex flex-col items-center rounded-xl border border-border bg-card p-6 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 font-semibold text-foreground">Office Location</h3>
                <p className="text-sm text-muted-foreground">
                  Muthaiga Square, off Thika Rd
                  <br />
                  Nairobi, Kenya
                </p>
              </div>
              
              {/* Phone Numbers */}
              <div className="flex flex-col items-center rounded-xl border border-border bg-card p-6 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <Phone className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 font-semibold text-foreground">Phone Numbers</h3>
                <div className="space-y-1">
                  <a
                    href="tel:+254700000000"
                    className="block text-sm text-muted-foreground hover:text-primary"
                  >
                    +254 700 000 000 (Main)
                  </a>
                  <a
                    href="tel:+254711000000"
                    className="block text-sm text-muted-foreground hover:text-primary"
                  >
                    +254 711 000 000 (Bookings)
                  </a>
                  <a
                    href="https://wa.me/254700000000"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-sm text-muted-foreground hover:text-primary"
                  >
                    +254 700 000 000 (WhatsApp)
                  </a>
                </div>
              </div>
              
              {/* Email Addresses */}
              <div className="flex flex-col items-center rounded-xl border border-border bg-card p-6 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 font-semibold text-foreground">Email Us</h3>
                <div className="space-y-1">
                  <a
                    href="mailto:info@Moventra Safaris & Logistics Ltd.co.ke"
                    className="block text-sm text-muted-foreground hover:text-primary"
                  >
                    info@Moventra Safaris & Logistics Ltd.co.ke
                  </a>
                  <a
                    href="mailto:booking@moventrasafarislogisticsltd.com"
                    className="block text-sm text-muted-foreground hover:text-primary"
                  >
                    booking@moventrasafarislogisticsltd.com
                  </a>
                  <a
                    href="mailto:support@Moventra Safaris & Logistics Ltd.co.ke"
                    className="block text-sm text-muted-foreground hover:text-primary"
                  >
                    support@Moventra Safaris & Logistics Ltd.co.ke
                  </a>
                </div>
              </div>
              
              {/* Social Media */}
              <div className="flex flex-col items-center rounded-xl border border-border bg-card p-6 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <svg className="h-6 w-6 text-primary" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </div>
                <h3 className="mb-2 font-semibold text-foreground">Follow Us</h3>
                <div className="space-y-1 text-sm">
                  <a
                    href="https://facebook.com/Moventra Safaris & Logistics Ltd"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-muted-foreground hover:text-primary"
                  >
                    Facebook: @Moventra Safaris & Logistics Ltd
                  </a>
                  <a
                    href="https://instagram.com/Moventra Safaris & Logistics Ltd"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-muted-foreground hover:text-primary"
                  >
                    Instagram: @Moventra Safaris & Logistics Ltd
                  </a>
                  <a
                    href="https://twitter.com/Moventra Safaris & Logistics Ltd"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-muted-foreground hover:text-primary"
                  >
                    X (Twitter): @Moventra Safaris & Logistics Ltd
                  </a>
                  <a
                    href="https://tiktok.com/@Moventra Safaris & Logistics Ltd"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-muted-foreground hover:text-primary"
                  >
                    TikTok: @Moventra Safaris & Logistics Ltd
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
