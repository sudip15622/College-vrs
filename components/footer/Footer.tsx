"use client";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { FaPhoneVolume, FaSquareXTwitter } from "react-icons/fa6";
import { FaFacebook, FaInstagramSquare } from "react-icons/fa";
import { MdEmail } from "react-icons/md";

const Footer = () => {
  const productPages = [
    {
      name: "Home",
      link: "/",
    },
    {
      name: "Vehicles",
      link: "/search",
    },
    {
      name: "Become a Host",
      link: "/create",
    },
  ];
  const companyPages = [
    {
      name: "About",
      link: "/about",
    },
    {
      name: "Contact Us",
      link: "/contact",
    },
    {
      name: "Privacy Policies",
      link: "/privacy",
    },
    {
      name: "Login",
      link: "/login",
    },
  ];

  const socialPages = [
    {
      icon: <FaFacebook />,
      link: "https://www.facebook.com",
    },
    {
      icon: <FaInstagramSquare />,
      link: "https://www.instagram.com",
    },
    {
      icon: <FaSquareXTwitter />,
      link: "https://www.x.com",
    },
  ];
  return (
    <footer className="py-10 shadow-md z-50 flex flex-col w-full mx-auto lg:px-16 md:px-10 sm:px-8 px-4 gap-y-5 border-t border-border">
      <div className="w-full flex flex-row items-start justify-between">
        <div className="flex flex-col">
          <h3 className="font-medium text-sm mb-4">PRODUCT</h3>
          {productPages.map((page, index) => {
            return (
              <Link
                className="hover:underline transition-all duration-200 ease-in-out text-muted-foreground hover:text-foreground mb-2"
                key={index}
                href={page.link}
              >
                {page.name}
              </Link>
            );
          })}
        </div>
        <div className="flex flex-col">
          <h3 className="font-medium text-sm mb-4">COMPANY</h3>
          {companyPages.map((page, index) => {
            return (
              <Link
                className="hover:underline transition-all duration-200 ease-in-out text-muted-foreground hover:text-foreground mb-2"
                key={index}
                href={page.link}
              >
                {page.name}
              </Link>
            );
          })}
        </div>
        <div className="flex flex-col">
          <h3 className="font-medium text-sm mb-4">CONTACT</h3>
          <div className="flex flex-row gap-x-2 text-muted-foreground mb-2 items-center">
            <div className="flex items-center justify-center text-sm">
              <FaPhoneVolume />
            </div>
            <div>9821253635 | 9769756048</div>
          </div>
          <div className="flex flex-row gap-x-2 text-muted-foreground items-center mb-2">
            <div className="flex items-center justify-center text-lg">
              <MdEmail />
            </div>
            <a href="mailto:contact@sajiloride.com">contact@sajiloride.com</a>
          </div>
        </div>
      </div>
      <div className="bg-border w-full h-px"></div>
      <div className="flex flex-row items-center justify-between">
        <Link
          href="/"
          className="flex items-center text-lg text-primary font-semibold gap-2 hover:opacity-90 duration-200 ease-in-out transition-opacity hover:text-shadow-2xs group z-50"
        >
          <Image
            className="object-cover group-hover:transform group-hover:scale-110 duration-200 ease-in-out"
            src={"/sajilo_ride.png"}
            width={35}
            height={35}
            alt="sajilo-ride-logo"
            priority
          />
          Sajilo Ride
        </Link>
        <div className="text-muted-foreground">
          Copyright &copy; | www.sajiloride.com - 2026 | All Rights Reserved
        </div>
        <div className="flex flex-row items-center gap-x-2">
          {socialPages.map((page, index) => {
            return (
              <a
                key={index}
                href={page.link}
                target="_blank"
                className="flex items-center justify-center text-xl text-muted-foreground transition-all duration-200 ease-in-out hover:text-foreground"
              >
                {page.icon}
              </a>
            );
          })}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
