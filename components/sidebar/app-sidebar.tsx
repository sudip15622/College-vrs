"use client";

import * as React from "react";
import {
  Home,
  Bike,
  Calendar,
  Users,
  Settings,
  LayoutDashboard,
  Heart,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { User } from "next-auth";
import Image from "next/image";

// Menu items for admin
const adminMenuItems = [
  {
    title: "Dashboard",
    url: "/hosting",
    icon: LayoutDashboard,
  },
  {
    title: "Vehicles",
    url: "/hosting/listings",
    icon: Bike,
  },
  {
    title: "Bookings",
    url: "/hosting/bookings",
    icon: Calendar,
  },
  {
    title: "Users",
    url: "/hosting/users",
    icon: Users,
  },
  {
    title: "Settings",
    url: "/hosting/settings",
    icon: Settings,
  },
];

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: User;
}

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
              className={pathname === "/hosting" ? "bg-accent" : ""}
            >
              <Link href="/hosting">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Home className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Admin Panel</span>
                  <span className="truncate text-xs">Manage Platform</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminMenuItems.map((item) => {
                const isActive =
                  item.url === "/hosting"
                    ? pathname === item.url
                    : pathname === item.url || pathname.startsWith(item.url + "/");
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      className={isActive ? "bg-border hover:bg-border" : ""}
                    >
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/profile">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-border overflow-hidden">
                  <Image
                    src="/default_user.png"
                    alt={user.name || "User"}
                    width={32}
                    height={32}
                    className="object-cover"
                  />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      
      <SidebarRail />
    </Sidebar>
  );
}
