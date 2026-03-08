"use client";

import React, { useRef, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar } from "../ui/calendar";
import { Slider } from "../ui/slider";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import Link from "next/link";
import {
  FaSearch,
  FaMotorcycle,
  FaBicycle,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { RxCross2 } from "react-icons/rx";
import { cn } from "@/lib/utils";
import { Input } from "../ui/input";

type FilterType = "name" | "dateRange" | "type" | "priceRange" | null;

const SearchBar = () => {
  const searchParams = useSearchParams();

  const [activeFilter, setActiveFilter] = useState<FilterType>(null);

  // Search state
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [priceRange, setPriceRange] = useState([0, 9999]);

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const searchBarRef = useRef<HTMLDivElement | null>(null);
  const refs = useRef<Record<string, HTMLDivElement | null>>({
    name: null,
    dateRange: null,
    priceRange: null,
    type: null,
  });

  const [indicator, setIndicator] = useState<{
    left: number;
    width: number;
  } | null>(null);

  // Sync with URL params
  useEffect(() => {
    setName(searchParams.get("name") || "");
    setType(searchParams.get("type") || "");

    const from = searchParams.get("startDate");
    const to = searchParams.get("endDate");
    if (from && to) {
      setDateRange({ from: new Date(from), to: new Date(to) });
    } else if (from) {
      setDateRange({ from: new Date(from), to: undefined });
    } else {
      setDateRange(undefined);
    }

    setPriceRange([
      Number(searchParams.get("minPrice")) || 0,
      Number(searchParams.get("maxPrice")) || 9999,
    ]);
  }, [searchParams]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setActiveFilter(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Update indicator position
  useEffect(() => {
    updateIndicator(activeFilter);
    const onResize = () => updateIndicator(activeFilter);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [activeFilter, name, type, dateRange, priceRange]);

  const updateIndicator = (filter: FilterType) => {
    if (!filter || !searchBarRef.current) {
      setIndicator(null);
      return;
    }
    const target = refs.current[filter];
    if (!target) {
      setIndicator(null);
      return;
    }
    const parentRect = searchBarRef.current.getBoundingClientRect();
    const rect = target.getBoundingClientRect();
    setIndicator({
      left: rect.left - parentRect.left,
      width: rect.width,
    });
  };

  const handleFilterClick = (filter: FilterType) => {
    setActiveFilter(filter);
  };

  const handleBrandNameSelect = (brand: string) => {
    setName(brand);
    setActiveFilter("dateRange");
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) {
      setDateRange(undefined);
      return;
    }

    if (!dateRange?.from && !dateRange?.to) {
      setDateRange({ from: date, to: undefined });
      return;
    }

    if (dateRange?.from && !dateRange?.to) {
      if (date < dateRange.from) {
        setDateRange({ from: date, to: dateRange.from });
      } else {
        setDateRange({ from: dateRange.from, to: date });
      }
      return;
    }

    if (dateRange?.from && dateRange?.to) {
      setDateRange({ from: date, to: undefined });
    }
  };

  const handleVehicleSelect = (value: string) => {
    setType(value);
  };

  const handlePriceChange = (values: number[]) => {
    setPriceRange([values[0], values[1]]);
  };

  const getSearchUrl = () => {
    const params = new URLSearchParams(searchParams.toString());

    if (name) params.set("name", name);
    else params.delete("name");

    if (type) params.set("type", type);
    else params.delete("type");

    if (dateRange?.from) params.set("startDate", dateRange.from.toISOString());
    else params.delete("startDate");

    if (dateRange?.to) params.set("endDate", dateRange.to.toISOString());
    else params.delete("endDate");

    if (priceRange[0] !== 0) params.set("minPrice", priceRange[0].toString());
    else params.delete("minPrice");

    if (priceRange[1] !== 9999)
      params.set("maxPrice", priceRange[1].toString());
    else params.delete("maxPrice");

    params.delete("page");

    return `/?${params.toString()}`;
  };

  const handleSearchClick = () => {
    setActiveFilter(null);
  };

  const getFilterClassName = (filterType: FilterType) =>
    cn(
      "flex flex-col items-start px-5 py-2 rounded-full transition-colors duration-200 ease-in-out cursor-pointer relative z-10",
    );

  const computePopoverStyle = () => {
    const parentRect = wrapperRef.current?.getBoundingClientRect();
    if (!parentRect)
      return { left: 0, width: "100%" as string, height: 480, top: 80 };

    const parentWidth = parentRect.width;
    const topOffset = 70;

    if (activeFilter === "name") {
      const w = parentWidth / 4;
      return { left: 0, width: w, height: 320, top: topOffset };
    }
    if (activeFilter === "dateRange") {
      const w = (parentWidth * 3) / 4;
      return { left: 0, width: w, height: 480, top: topOffset };
    }
    if (activeFilter === "priceRange") {
      const w = (parentWidth * 3) / 4;
      return { left: parentWidth - w, width: w, height: 360, top: topOffset };
    }
    if (activeFilter === "type") {
      const w = parentWidth / 4;
      return { left: parentWidth - w, width: w, height: 120, top: topOffset };
    }
    return { left: 0, width: parentWidth, height: 380, top: topOffset };
  };

  const popoverStyle = computePopoverStyle();

  const vehicleBrands = ["Honda", "BMW", "Yamaha", "Suzuki", "Bugatti"];

  const vehicleTypes = [
    { value: "Bike", label: "Bike", icon: FaMotorcycle },
    { value: "Scooter", label: "Scooter", icon: FaBicycle },
  ];

  const getContent = (filterType: FilterType) => {
    switch (filterType) {
      case "name":
        return (
          <>
            <div className="text-sm text-muted-foreground font-normal mb-4">
              Suggested brands
            </div>
            <ul className="flex flex-col gap-y-3 overflow-y-auto max-h-60 [&::-webkit-scrollbar]:hidden">
              {vehicleBrands.map((brand) => (
                <li
                  key={brand}
                  onClick={() => handleBrandNameSelect(brand)}
                  className="flex gap-x-3 items-center cursor-pointer hover:bg-border p-2 rounded-md transition-colors duration-200 ease-in-out"
                >
                  <div className="flex items-center justify-center p-2 rounded-lg bg-background text-xl text-muted-foreground">
                    <FaMotorcycle />
                  </div>
                  {brand}
                </li>
              ))}
            </ul>
          </>
        );

      case "dateRange":
        return (
          <div className="flex justify-center py-2">
            <Calendar
              mode="single"
              selected={dateRange?.to || dateRange?.from}
              onSelect={handleDateSelect}
              showOutsideDays={false}
              numberOfMonths={2}
              disabled={(date) =>
                date < new Date(new Date().setHours(0, 0, 0, 0))
              }
              modifiers={{
                range_start: dateRange?.from,
                range_end: dateRange?.to,
                range_middle:
                  dateRange?.from && dateRange?.to
                    ? (date) => {
                        return date > dateRange.from! && date < dateRange.to!;
                      }
                    : undefined,
              }}
              className="rounded-lg w-full"
            />
          </div>
        );

      case "priceRange":
        return (
          <div className="space-y-6 px-2">
            {/* Header */}
            <div className="text-center">
              <h3 className="text-base font-semibold mb-1">
                Select Price Range
              </h3>
              <p className="text-sm text-muted-foreground">
                Choose your budget for the vehicle
              </p>
            </div>

            {/* Price Display with Inputs */}
            <div className="flex items-center justify-between gap-4 px-4">
              <div className="flex-1">
                <label className="text-sm mb-1 block">
                  Min Price
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    Rs.
                  </span>
                  <Input
                    type="number"
                    value={priceRange[0]}
                    onChange={(e) => {
                      const val = Math.max(
                        0,
                        Math.min(Number(e.target.value), priceRange[1]),
                      );
                      setPriceRange([val, priceRange[1]]);
                    }}
                    className="pl-10"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="pt-5 text-muted-foreground">—</div>

              <div className="flex-1">
                <label className="text-sm mb-1 block">
                  Max Price
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    Rs.
                  </span>
                  <Input
                    type="number"
                    value={priceRange[1]}
                    onChange={(e) => {
                      const val = Math.min(
                        9999,
                        Math.max(Number(e.target.value), priceRange[0]),
                      );
                      setPriceRange([priceRange[0], val]);
                    }}
                    className="pl-10"
                    placeholder="9999"
                  />
                </div>
              </div>
            </div>

            {/* Slider */}
            <div className="px-4 py-2">
              <Slider
                min={0}
                max={9999}
                step={100}
                value={priceRange}
                onValueChange={handlePriceChange}
                className="w-full"
              />
              <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                <span>Rs. 0</span>
                <span>Rs. 9,999</span>
              </div>
            </div>

            {/* Quick Preset Buttons */}
            <div className="px-4">
              <p className="text-sm mb-2">Quick Select</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Budget", range: [0, 2000] },
                  { label: "Mid Range", range: [2000, 5000] },
                  { label: "Premium", range: [5000, 9999] },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() =>
                      setPriceRange(preset.range as [number, number])
                    }
                    className={cn(
                      "px-3 py-2 text-sm rounded-lg border transition-all duration-200 cursor-pointer",
                      priceRange[0] === preset.range[0] &&
                        priceRange[1] === preset.range[1]
                        ? "bg-primary/10 border-primary text-primary"
                        : "border-border hover:border-primary/50 hover:bg-primary/5",
                    )}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case "type":
        return (
          <div className="flex gap-3">
            {vehicleTypes.map(({ label, icon: Icon, value }) => (
              <button
                key={label}
                onClick={() => handleVehicleSelect(value)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full border transition cursor-pointer",
                  type === value
                    ? "bg-primary/5 border-primary"
                    : "hover:border-primary/50",
                )}
              >
                <Icon />
                {label}
              </button>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="relative w-full max-w-5xl mx-auto" ref={wrapperRef}>
      <div className="relative flex flex-col items-center">
        {/* Search bar */}
        <div
          ref={searchBarRef}
          className={`relative z-10 flex items-center w-full rounded-full border border-border transition-all duration-200 ease-in-out ${
            activeFilter ? "bg-border" : "bg-card shadow-sm"
          } ${!activeFilter && "hover:shadow-md"}`}
        >
          {/* Morph indicator */}
          <AnimatePresence>
            {indicator && (
              <motion.div
                key="indicator"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  left: indicator.left,
                  width: indicator.width,
                }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: "spring", stiffness: 400, damping: 50 }}
                className="absolute top-0 bottom-0 bg-card rounded-full"
                style={{ position: "absolute" }}
              />
            )}
          </AnimatePresence>

          {/* name */}
          <div
            ref={(el: HTMLDivElement | null): void => {
              refs.current["name"] = el;
            }}
            onClick={() => handleFilterClick("name")}
            className={cn(getFilterClassName("name"), "w-1/3")}
          >
            <label
              className="text-sm font-semibold w-full cursor-pointer"
              htmlFor="name"
            >
              Which
            </label>
            <input
              type="text"
              id="name"
              placeholder="Search vehicles..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full truncate text-md bg-transparent border-none outline-none placeholder:text-muted-foreground"
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                setName("");
              }}
              className={`absolute top-1/2 right-4 -translate-y-1/2 p-1 cursor-pointer text-md rounded-full hover:bg-background duration-200 transition-all ease-in-out ${
                activeFilter === "name" && name
                  ? "opacity-100 pointer-events-auto"
                  : "opacity-0 pointer-events-none"
              }`}
            >
              <RxCross2 />
            </button>
          </div>

          {!activeFilter && (
            <div className="absolute top-1/2 -translate-y-1/2 left-1/4 h-8 w-0.5 bg-border"></div>
          )}

          {/* Dates */}
          <div
            ref={(el: HTMLDivElement | null): void => {
              refs.current["dateRange"] = el;
            }}
            onClick={() => handleFilterClick("dateRange")}
            className={cn(getFilterClassName("dateRange"), "w-1/3")}
          >
            <div className="text-sm font-semibold">When</div>
            <div className="text-md truncate w-full">
              {dateRange?.from && dateRange?.to ? (
                `${format(dateRange.from, "MMM dd")} - ${format(
                  dateRange.to,
                  "MMM dd",
                )}`
              ) : dateRange?.from ? (
                format(dateRange.from, "MMM dd")
              ) : (
                <span className="text-muted-foreground">Add dates</span>
              )}
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setDateRange(undefined);
              }}
              className={`absolute top-1/2 right-4 -translate-y-1/2 p-1 cursor-pointer text-md rounded-full hover:bg-background duration-200 transition-all ease-in-out ${
                activeFilter === "dateRange" && dateRange
                  ? "opacity-100 pointer-events-auto"
                  : "opacity-0 pointer-events-none"
              }`}
            >
              <RxCross2 />
            </button>
          </div>

          {!activeFilter && (
            <div className="absolute top-1/2 -translate-y-1/2 left-2/4 h-8 w-0.5 bg-border"></div>
          )}

          {/* price ranges */}
          <div
            ref={(el: HTMLDivElement | null): void => {
              refs.current["priceRange"] = el;
            }}
            onClick={() => handleFilterClick("priceRange")}
            className={cn(getFilterClassName("priceRange"), "w-1/3")}
          >
            <div className="text-sm font-semibold">Prices</div>
            <div className="text-md truncate w-full">
              {priceRange[0] > 0 && priceRange[1] < 9999 ? (
                `Rs. ${priceRange[0]} - ${priceRange[1]}`
              ) : priceRange[0] > 0 ? (
                `Above Rs. ${priceRange[0]}`
              ) : priceRange[1] < 9999 ? (
                `Below Rs. ${priceRange[1]}`
              ) : (
                <span className="text-muted-foreground">Any price</span>
              )}
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setPriceRange([0, 9999]);
              }}
              className={`absolute top-1/2 right-4 -translate-y-1/2 p-1 cursor-pointer text-md rounded-full hover:bg-background duration-200 transition-all ease-in-out ${
                activeFilter === "priceRange" && (priceRange[0] > 0 || priceRange[1] < 9999)
                  ? "opacity-100 pointer-events-auto"
                  : "opacity-0 pointer-events-none"
              }`}
            >
              <RxCross2 />
            </button>
          </div>

          {!activeFilter && (
            <div className="absolute top-1/2 -translate-y-1/2 left-3/4 h-8 w-0.5 bg-border"></div>
          )}

          {/* Vehicle Type */}
          <div
            ref={(el: HTMLDivElement | null): void => {
              refs.current["type"] = el;
            }}
            onClick={() => handleFilterClick("type")}
            className={cn(getFilterClassName("type"), "w-1/3")}
          >
            <div className="text-sm font-semibold">Type</div>
            <div className="text-md truncate">
              {type || <span className="text-muted-foreground">Select...</span>}
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setType("");
              }}
              className={`absolute top-1/2 left-4/10 -translate-y-1/2 p-1 cursor-pointer text-md rounded-full hover:bg-background duration-200 transition-all ease-in-out ${
                activeFilter === "type" && type
                  ? "opacity-100 pointer-events-auto"
                  : "opacity-0 pointer-events-none"
              }`}
            >
              <RxCross2 />
            </button>
          </div>

          {/* Search Button */}
          <motion.div
            initial={{
              width: "3.8rem",
            }}
            animate={{
              width: activeFilter ? "8rem" : "3.8rem",
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
              mass: 0.8,
            }}
            className="absolute top-0 right-0 rounded-full h-full w-auto bg-transparent p-2 flex items-center justify-center z-20"
          >
            <Link
              href={getSearchUrl()}
              onClick={handleSearchClick}
              className="bg-primary h-full w-full rounded-full transition-colors duration-200 ease-in-out hover:bg-primary/90 text-primary-foreground cursor-pointer p-2 flex items-center justify-center gap-2 overflow-hidden"
            >
              <FaSearch className="text-lg shrink-0" />
              {activeFilter && (
                <span className="font-semibold text-sm">Search</span>
              )}
            </Link>
          </motion.div>
        </div>

        {/* Popover */}
        <AnimatePresence>
          {activeFilter && (
            <motion.div
              key="popover"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{
                opacity: 1,
                scale: 1,
                // y: -20,
                left: popoverStyle.left,
                width: popoverStyle.width,
                height: popoverStyle.height,
              }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 50,
              }}
              className={cn(
                "absolute bg-card border border-border rounded-2xl p-5 shadow-xl overflow-hidden",
              )}
              style={{
                position: "absolute",
                top: popoverStyle.top || 96,
                left:
                  typeof popoverStyle.left === "number" ? popoverStyle.left : 0,
                width:
                  typeof popoverStyle.width === "number"
                    ? popoverStyle.width
                    : "100%",
                height:
                  typeof popoverStyle.height === "number"
                    ? popoverStyle.height
                    : "70%",
                zIndex: 50,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {getContent(activeFilter)}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SearchBar;
