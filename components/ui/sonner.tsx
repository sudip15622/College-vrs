"use client"

import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      position="top-center"
      expand={true}
      duration={4000}
      closeButton
      icons={{
        success: (
          <CircleCheckIcon className="size-5 text-green-600" />
        ),
        info: (
          <InfoIcon className="size-5 text-blue-600" />
        ),
        warning: (
          <TriangleAlertIcon className="size-5 text-amber-600" />
        ),
        error: (
          <OctagonXIcon className="size-5 text-red-600" />
        ),
        loading: (
          <Loader2Icon className="size-5 animate-spin text-gray-600" />
        ),
      }}
      toastOptions={{
        unstyled: false,
        classNames: {
          toast: "group toast group-[.toaster]:bg-white group-[.toaster]:border group-[.toaster]:border-gray-200 group-[.toaster]:shadow-lg group-[.toaster]:rounded-lg",
          description: "group-[.toast]:text-gray-600",
          actionButton: "group-[.toast]:bg-gray-900 group-[.toast]:text-white group-[.toast]:hover:bg-gray-800",
          cancelButton: "group-[.toast]:bg-gray-100 group-[.toast]:text-gray-700 group-[.toast]:hover:bg-gray-200",
          success: "!bg-white !text-green-700 !border-green-200",
          error: "!bg-white !text-red-700 !border-red-200",
          warning: "!bg-white !text-amber-700 !border-amber-200",
          info: "!bg-white !text-blue-700 !border-blue-200",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
