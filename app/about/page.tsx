import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Users, Shield, Clock, Award } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = {
  title: "About Us | SavannaTrail Logistics & Tours",
  description: "Learn about SavannaTrail - Kenya's trusted partner for logistics, transportation, and tour services. Our story, mission, and commitment to excellence.",
};

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 sm:py-28 overflow-hidden">
          <div className="absolute inset-0">
            <Image
              src="/images/hero-safari.jpg"
              alt="African Safari"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-background/85" />
          </div>
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="mb-4 text-4xl font-bold text-foreground sm:text-5xl">
              About <span className="text-primary">SavannaTrail</span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Your trusted partner for logistics, transportation, and tour services across Kenya and East Africa. Journeys that connect.
            </p>
          </div>
        </section>

        {/* Our Story */}
        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              <div>
                <h2 className="mb-6 text-3xl font-bold text-foreground sm:text-4xl">
                  Our Story
                </h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    SavannaTrail was founded with a simple mission: to provide reliable, professional, and customer-focused logistics and tour services in Kenya. What started as a small car rental operation has grown into a comprehensive service provider covering everything from safari tours to cargo handling.
                  </p>
                  <p>
                    With over 10 years of experience in the industry, we&apos;ve built a reputation for excellence, reliability, and customer satisfaction. Our team of experienced professionals is dedicated to ensuring every journey is smooth, safe, and memorable.
                  </p>
                  <p>
                    Today, SavannaTrail operates a fleet of over 50 vehicles and serves hundreds of satisfied customers across Kenya and East Africa. We continue to grow and innovate, always keeping our customers&apos; needs at the heart of everything we do.
                  </p>
                </div>
              </div>
              <div className="relative aspect-square overflow-hidden rounded-2xl">
                <Image
                  src="/images/hero-suv.jpg"
                  alt="SavannaTrail Fleet"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="bg-muted/30 py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 md:grid-cols-2">
              <Card className="border-primary/20">
                <CardContent className="p-8">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Award className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-4 text-2xl font-bold text-foreground">Our Mission</h3>
                  <p className="text-muted-foreground">
                    To provide exceptional logistics and tour services that exceed our customers&apos; expectations, while maintaining the highest standards of safety, reliability, and professionalism. We strive to make every journey a positive experience.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-primary/20">
                <CardContent className="p-8">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-4 text-2xl font-bold text-foreground">Our Vision</h3>
                  <p className="text-muted-foreground">
                    To be East Africa&apos;s leading logistics and tour company, recognized for our commitment to excellence, innovation, and customer satisfaction. We aim to connect people, places, and possibilities across the region.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Core Values */}
        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
                Our Core Values
              </h2>
              <p className="mx-auto max-w-2xl text-muted-foreground">
                These principles guide everything we do at SavannaTrail.
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">Reliability</h3>
                <p className="text-sm text-muted-foreground">
                  We deliver on our promises, every time. You can count on us.
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">Customer First</h3>
                <p className="text-sm text-muted-foreground">
                  Your satisfaction is our priority. We go the extra mile.
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <CheckCircle2 className="h-8 w-8 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">Excellence</h3>
                <p className="text-sm text-muted-foreground">
                  We strive for the highest standards in everything we do.
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Clock className="h-8 w-8 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">Punctuality</h3>
                <p className="text-sm text-muted-foreground">
                  Time is valuable. We respect yours by being on time.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="bg-primary py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 text-center">
              <div>
                <div className="text-5xl font-bold text-primary-foreground">500+</div>
                <div className="mt-2 text-primary-foreground/80">Happy Customers</div>
              </div>
              <div>
                <div className="text-5xl font-bold text-primary-foreground">50+</div>
                <div className="mt-2 text-primary-foreground/80">Vehicles in Fleet</div>
              </div>
              <div>
                <div className="text-5xl font-bold text-primary-foreground">10+</div>
                <div className="mt-2 text-primary-foreground/80">Years Experience</div>
              </div>
              <div>
                <div className="text-5xl font-bold text-primary-foreground">8</div>
                <div className="mt-2 text-primary-foreground/80">Service Categories</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
              Ready to Experience SavannaTrail?
            </h2>
            <p className="mx-auto mb-8 max-w-2xl text-muted-foreground">
              Whether you need a car rental, safari tour, or logistics support, we&apos;re here to help. Get in touch today.
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
        </section>
      </main>

      <Footer />
    </div>
  );
}
