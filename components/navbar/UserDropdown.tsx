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
import { useRouter } from "next/navigation";
import { FaRegUser, FaRegHeart } from "react-icons/fa";
import { MdDirectionsBike } from "react-icons/md";
import { IoSettingsOutline } from "react-icons/io5";
import { signOutAction } from "@/lib/actions/auth";
import { toast } from "sonner";

interface UserDropdownProps {
  user: User;
}

const UserDropdown = ({ user }: UserDropdownProps) => {
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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="w-10 h-10 min-w-10 max-w-10 relative overflow-hidden rounded-full bg-border cursor-pointer">
          <Image
            className="object-cover w-full h-full"
            src={user.image || "/default_user.png"}
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
              src={user.image || "/default_user.png"}
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
  );
};

export default UserDropdown;
