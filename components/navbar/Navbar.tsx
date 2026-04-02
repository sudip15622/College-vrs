"use client";
import { User } from "next-auth";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import dynamic from "next/dynamic";

const UserDropdown = dynamic(() => import("./UserDropdown"), { ssr: false });

interface NavbarProps {
  user: User | null;
}

const Navbar = ({ user }: NavbarProps) => {
  const mainPages = [
    {
      name: "Vehicles",
      link: "/search",
      url: "/scooter_logo.png",
    },
    {
      name: "About",
      link: "/about",
      url: "/about_logo.png",
    },
    {
      name: "Contact",
      link: "/contact",
      url: "/contact_logo.png",
    },
  ];
  return (
    <nav className="sticky top-0 bg-background shadow-sm z-50 flex flex-row items-center justify-between w-full mx-auto lg:px-16 md:px-10 sm:px-8 px-4 py-4">
      <div className="flex flex-row gap-x-10 items-center justify-center">
        {mainPages.map((page, index) => {
          return (
            <Link
              key={index}
              href={page.link}
              className="flex flex-row gap-x-2 items-center hover:text-primary text-md font-semibold transition-colors duration-200 ease-in-out group"
            >
              <Image
                className="object-cover group-hover:transform group-hover:scale-110 duration-200 transition-all ease-in-out"
                src={page.url}
                width={30}
                height={30}
                alt={page.name}
                priority
              />
              {page.name}
            </Link>
          );
        })}
      </div>
      <Link
          href="/"
          className=" absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2 hover:opacity-90 duration-200 ease-in-out transition-opacity hover:text-shadow-2xs group"
        >
          <Image
            className="object-cover group-hover:transform group-hover:scale-110 duration-200 ease-in-out"
            src={"/sajilo_ride.png"}
            width={50}
            height={50}
            alt="sajilo-ride-logo"
            priority
          />
          {/* <span className="text-xl font-bold text-primary">Sajilo Ride</span> */}
        </Link>

      {user ? (
        <UserDropdown user={user} />
      ) : (
        <div className="flex items-center gap-x-5">
          <Link
            href="/login"
            className="whitespace-nowrap py-2 px-4 bg-secondary text-md text-secondary-foreground rounded-xl font-medium hover:bg-secondary/90 transition-all duration-200 ease-in-out shadow-sm hover:shadow-md"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="whitespace-nowrap py-2 px-4 bg-primary text-md text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-all duration-200 ease-in-out shadow-sm hover:shadow-md"
          >
            Signup
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
