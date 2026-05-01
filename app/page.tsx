import Link from "next/link";
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
          {/* Background Pattern */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -right-40 -top-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
            {/* Route Lines */}
            <svg
              className="absolute inset-0 h-full w-full opacity-10"
              viewBox="0 0 1000 1000"
              preserveAspectRatio="none"
            >
              <path
                d="M0,500 Q250,100 500,500 T1000,500"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                className="text-primary"
              />
              <path
                d="M0,600 Q250,200 500,600 T1000,600"
                stroke="currentColor"
                strokeWidth="1"
                fill="none"
                className="text-primary"
              />
            </svg>
          </div>

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm text-primary">
                <MapPin className="h-4 w-4" />
                <span>Serving Kenya & East Africa</span>
              </div>
              <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl text-balance">
                Your Journey,{" "}
                <span className="text-primary">Our Expertise</span>
              </h1>
              <p className="mb-8 text-lg text-muted-foreground sm:text-xl text-pretty">
                From car rentals to safari adventures, airport transfers to cargo handling — 
                SavannaTrail is your trusted partner for all logistics and transportation needs across Kenya. Journeys that connect.
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
        <section className="bg-card py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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
                  Why Choose SavannaTrail?
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
            <div className="grid gap-8 md:grid-cols-3">
              <div className="flex flex-col items-center rounded-xl border border-border bg-card p-6 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 font-semibold text-foreground">Visit Us</h3>
                <p className="text-sm text-muted-foreground">
                  Muthaiga Square, off Thika Rd
                  <br />
                  Nairobi, Kenya
                </p>
              </div>
              <div className="flex flex-col items-center rounded-xl border border-border bg-card p-6 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <Phone className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 font-semibold text-foreground">Call Us</h3>
                <a
                  href="tel:+254700000000"
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  +254 700 000 000
                </a>
              </div>
              <div className="flex flex-col items-center rounded-xl border border-border bg-card p-6 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 font-semibold text-foreground">Email Us</h3>
                <a
                  href="mailto:info@savannatrail.co.ke"
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  info@savannatrail.co.ke
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
