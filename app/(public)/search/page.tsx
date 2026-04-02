import SearchBar from "@/components/homepage/SearchBar";
import SearchPageClient from "@/components/homepage/SearchPageClient";
import React from "react";

const page = () => {
  return (
    <div className="w-full mx-auto space-y-10">
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
    </div>
  );
};

export default page;
