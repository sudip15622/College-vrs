"use client";
import { User } from "next-auth";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TbLogout } from "react-icons/tb";
// import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { FaRegUser, FaRegHeart } from "react-icons/fa";
import { MdDirectionsBike, MdOutlineSettings } from "react-icons/md";
import { IoSettingsOutline } from "react-icons/io5";
import { signOutAction } from "@/lib/actions/auth";
import { toast } from "sonner";

interface NavbarProps {
  user: User | null;
}

const Navbar = ({ user }: NavbarProps) => {
  const router = useRouter();
  const performSignOut = async () => {
    try {
      const response = await signOutAction();

      if (response.success) {
        toast.success(response.message);
      } else {
        toast.error("Failed to signout!");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to signout!");
    } finally {
      router.refresh();
    }
  };

  const mainPages = [
    {
      name: "Vehicles",
      link: "/",
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="w-10 h-10 min-w-10 max-w-10 relative overflow-hidden rounded-full bg-border cursor-pointer">
              <Image
                className="object-cover w-full h-full"
                src={"/default_user.png"}
                alt={user.name}
                fill
                sizes="40px"
                priority
              />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-full max-w-100">
            <DropdownMenuLabel className="flex flex-row items-center gap-x-3">
              <div className="w-10 h-10 relative overflow-hidden rounded-full bg-border">
                <Image
                  className="object-cover w-full h-full"
                  src={"/default_user.png"}
                  alt={user.name}
                  fill
                  sizes="40px"
                  priority
                />
              </div>
              <div className="flex flex-col gap-x-1 text-foreground">
                <div className="font-medium text-base">{user.name}</div>
                <div className="font-normal text-sm">{user.role}</div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuItem>
              <Link href="/trips" className="w-full flex items-center gap-x-2 py-2 font-medium">
                <MdDirectionsBike className="size-5"/>
                Trips
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link
                href="/wishlists"
                className="w-full flex items-center gap-x-2 py-2 font-medium"
              >
                <FaRegHeart className="size-5"/>
                WishLists
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link
                href="/profile"
                className="w-full flex items-center gap-x-2 py-2 font-medium"
              >
                <FaRegUser className="size-5"/>
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link
                href="/account-settings"
                className="w-full flex items-center gap-x-2 py-2 font-medium"
              >
                <IoSettingsOutline className="size-5"/>
                Account Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={(e) => {
                performSignOut();
              }}
              className="cursor-pointer py-2 font-medium"
            >
              <TbLogout className="size-5" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
