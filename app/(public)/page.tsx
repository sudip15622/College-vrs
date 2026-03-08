import SearchBar from "@/components/homepage/SearchBar";
import SearchPageClient from "@/components/homepage/SearchPageClient";
import {
  FaMotorcycle,
  FaShieldAlt,
  FaClock,
  FaMapMarkedAlt,
} from "react-icons/fa";

export default async function Home() {
  return (
    <div className="w-full mx-auto space-y-10 py-12">
      <div className="space-y-10">
        <div className="text-center leading-tight">
          <h1 className="text-4xl font-bold">Find your perfect ride</h1>
          <p className="text-lg text-muted-foreground mt-2">
            Explore our wide range of bikes and scooters with affordable rates
            and easy booking
          </p>
        </div>
        <SearchBar />
      </div>
      <SearchPageClient />

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
