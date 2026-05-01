import { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ServiceCard } from "@/components/services/service-card";
import { services } from "@/lib/services";

export const metadata: Metadata = {
  title: "Our Services",
  description: "Explore our comprehensive range of logistics and tour services including car rental, safari tours, movers, cargo handling, and more.",
};

export default function ServicesPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-card py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="mb-4 text-4xl font-bold text-foreground sm:text-5xl">
                Our Services
              </h1>
              <p className="text-lg text-muted-foreground">
                From personal transportation to commercial logistics, we offer a complete range of services 
                to meet your needs. Select a service below to learn more and book.
              </p>
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
