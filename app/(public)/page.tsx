import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  FaMotorcycle,
  FaShieldAlt,
  FaClock,
  FaMapMarkedAlt,
} from "react-icons/fa";
import RecommendedVehiclesSection, {
  RecommendedVehiclesSkeleton,
} from "@/components/homepage/RecommendedVehiclesSection";

export default async function Home() {
  return (
    <div className="w-full mx-auto space-y-10">
      {/* Hero Section */}
      <section className="w-full mx-auto text-foreground pb-16 pt-10">
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          <div className="space-y-6">
            <p className="inline-flex items-center rounded-full bg-primary/10 text-primary px-3 py-1 text-xs tracking-[0.2em] uppercase">
              Ride Smarter Everyday
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.05]">
              Book The Perfect
              <span className="block text-primary/70">
                Bike In Minutes
              </span>
            </h1>
            <p className="max-w-xl text-muted-foreground text-base md:text-lg">
              Premium scooters and bikes, verified and ready to ride. Find your
              match, confirm instantly, and start your journey without delays.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/search"
                className="px-6 py-3 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
              >
                Browse Vehicles
              </Link>
              <Link
                href="/signup"
                className="px-6 py-3 rounded-full border border-border bg-background font-semibold hover:bg-muted transition-colors"
              >
                Get Started
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-2 max-w-md text-center">
              <div className="rounded-xl bg-card border border-border px-3 py-3">
                <p className="text-2xl font-bold">500+</p>
                <p className="text-xs text-muted-foreground">Vehicles</p>
              </div>
              <div className="rounded-xl bg-card border border-border px-3 py-3">
                <p className="text-2xl font-bold">10K+</p>
                <p className="text-xs text-muted-foreground">Rides</p>
              </div>
              <div className="rounded-xl bg-card border border-border px-3 py-3">
                <p className="text-2xl font-bold">4.8</p>
                <p className="text-xs text-muted-foreground">Rating</p>
              </div>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute -top-6 -left-6 h-28 w-28 rounded-full bg-background/20 blur-2xl" />
            <div className="absolute -bottom-8 -right-8 h-32 w-32 rounded-full bg-background/20 blur-2xl" />

            <div className="relative overflow-hidden rounded-3xl border border-background/20 bg-background/10 p-3 shadow-2xl">
              <div className="relative h-72 sm:h-80 md:h-96 overflow-hidden rounded-2xl">
                <Image
                  src="/hero_image.jpg"
                  alt="Sajilo Ride platform showcase"
                  fill
                  priority
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/35 via-transparent to-transparent" />
              </div>

              <div className="absolute left-6 bottom-6 rounded-xl bg-background/90 text-foreground px-4 py-3 shadow-lg transition-transform duration-300 group-hover:-translate-y-1">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Trusted Platform
                </p>
                <p className="text-sm font-semibold">100% Verified Vehicles</p>
              </div>

              <div className="absolute right-6 top-6 rounded-xl bg-background/90 text-foreground px-4 py-3 shadow-lg transition-transform duration-300 group-hover:translate-y-1">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Instant Experience
                </p>
                <p className="text-sm font-semibold">Quick Search and Booking</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recommended Vehicles Section */}
      <Suspense fallback={<RecommendedVehiclesSkeleton />}>
        <RecommendedVehiclesSection />
      </Suspense>
      
      {/* Features Section */}
      <section className="w-full mx-auto py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Why Choose Us</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="flex flex-col items-center text-center space-y-4 rounded-2xl shadow-sm border border-border p-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <FaMotorcycle className="text-3xl text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Wide Selection</h3>
            <p className="text-muted-foreground">
              Choose from our extensive collection of bikes and scooters
            </p>
          </div>
          <div className="flex flex-col items-center text-center space-y-4 rounded-2xl shadow-sm border border-border p-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <FaShieldAlt className="text-3xl text-primary" />
            </div>
            <h3 className="text-xl font-semibold">100% Verified</h3>
            <p className="text-muted-foreground">
              All vehicles are regularly serviced and safety checked
            </p>
          </div>
          <div className="flex flex-col items-center text-center space-y-4 rounded-2xl shadow-sm border border-border p-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <FaClock className="text-3xl text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Instant Booking</h3>
            <p className="text-muted-foreground">
              Quick and hassle-free booking process in minutes
            </p>
          </div>
          <div className="flex flex-col items-center text-center space-y-4 rounded-2xl shadow-sm border border-border p-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <FaMapMarkedAlt className="text-3xl text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Multiple Locations</h3>
            <p className="text-muted-foreground">
              Available across major cities for your convenience
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="w-full mx-auto py-16 bg-linear-to-r from-primary to-primary/80 rounded-3xl text-primary-foreground">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-8">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-primary-foreground">
                1
              </span>
            </div>
            <h3 className="text-xl font-semibold">Search & Filter</h3>
            <p className="text-muted-foreground w-3/4">
              Find your ideal vehicle by brand, type, and availability dates
            </p>
          </div>
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-primary-foreground">
                2
              </span>
            </div>
            <h3 className="text-xl font-semibold">Book Instantly</h3>
            <p className="text-muted-foreground w-3/4">
              Select your dates and confirm booking with just a few clicks
            </p>
          </div>
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-primary-foreground">
                3
              </span>
            </div>
            <h3 className="text-xl font-semibold">Hit the Road</h3>
            <p className="text-muted-foreground w-3/4">
              Pick up your vehicle and enjoy your journey with peace of mind
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="w-full mx-auto py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center space-y-2">
            <div className="text-4xl font-bold text-primary">500+</div>
            <p className="text-muted-foreground">Vehicles Available</p>
          </div>
          <div className="text-center space-y-2">
            <div className="text-4xl font-bold text-primary">10K+</div>
            <p className="text-muted-foreground">Happy Customers</p>
          </div>
          <div className="text-center space-y-2">
            <div className="text-4xl font-bold text-primary">24/7</div>
            <p className="text-muted-foreground">Customer Support</p>
          </div>
          <div className="text-center space-y-2">
            <div className="text-4xl font-bold text-primary">8+</div>
            <p className="text-muted-foreground">Cities Covered</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {/* <section className="w-full mx-auto py-16 bg-linear-to-r from-primary to-primary/80 rounded-3xl text-primary-foreground">
        <div className="text-center space-y-6 px-8">
          <h2 className="text-3xl md:text-4xl font-bold">Ready to Start Your Journey?</h2>
          <p className="text-lg opacity-90 max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust us for their vehicle rental needs
          </p>
          <button className="px-8 py-3 bg-background text-foreground rounded-full font-semibold hover:bg-background/90 transition-colors">
            Browse Vehicles
          </button>
        </div>
      </section> */}
    </div>
  );
}
