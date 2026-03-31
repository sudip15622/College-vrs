"use server";

import { Resend } from "resend";

type BookingCreatedEmailInput = {
  to: string;
  customerName?: string | null;
  customerEmail?: string | null;
  bookingId: string;
  vehicleName: string;
  startDate: Date;
  endDate: Date;
  totalDays: number;
  totalPrice: number;
  paymentMethod: string | null;
};

type BookingCancelledEmailInput = {
  to: string;
  customerName?: string | null;
  customerEmail?: string | null;
  bookingId: string;
  vehicleName: string;
  startDate: Date;
  endDate: Date;
  totalDays: number;
  totalPrice: number;
  cancellationReason?: string;
  isPaid: boolean;
  refundStatus?: "Pending" | "Processed" | "Failed" | null;
  refundAmount?: number | null;
};

type AdminBookingStatusChangedEmailInput = {
  to: string;
  customerName?: string | null;
  customerEmail?: string | null;
  bookingId: string;
  vehicleName: string;
  startDate: Date;
  endDate: Date;
  totalDays: number;
  totalPrice: number;
  newStatus: "Confirmed" | "Active" | "Completed" | "Cancelled" | "Pending";
  reason?: string;
};

const DEFAULT_FROM = "VRS <contact@sudip-lamichhane.com.np>";

function formatDate(value: Date) {
  return value.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatCurrency(value: number) {
  return `NPR ${value.toFixed(2)}`;
}

function greeting(name?: string | null) {
  return name?.trim() ? `Hi ${name.trim()},` : "Hi there,";
}

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  return new Resend(apiKey);
}

function getAdminEmail() {
  const adminEmail = process.env.VRS_ADMIN_EMAIL?.trim();
  return adminEmail || null;
}

export async function sendBookingCreatedEmail(input: BookingCreatedEmailInput) {
  const resend = getResendClient();
  const from = process.env.RESEND_FROM_EMAIL || DEFAULT_FROM;

  const dateRange = `${formatDate(input.startDate)} - ${formatDate(input.endDate)}`;

  await resend.emails.send({
    from,
    to: input.to,
    subject: `Booking created: ${input.vehicleName}`,
    text: [
      greeting(input.customerName),
      "",
      "Your booking has been created successfully.",
      `Booking ID: ${input.bookingId}`,
      `Vehicle: ${input.vehicleName}`,
      `Rental dates: ${dateRange}`,
      `Total days: ${input.totalDays}`,
      `Total amount: ${formatCurrency(input.totalPrice)}`,
      `Payment method: ${input.paymentMethod}`,
      "",
      "Thank you for booking with VRS.",
    ].join("\n"),
    html: `
      <div style="font-family: Arial, sans-serif; color: #111; line-height: 1.5;">
        <p>${greeting(input.customerName)}</p>
        <p>Your booking has been created successfully.</p>
        <div style="padding: 12px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <p style="margin: 0 0 8px;"><strong>Booking ID:</strong> ${input.bookingId}</p>
          <p style="margin: 0 0 8px;"><strong>Vehicle:</strong> ${input.vehicleName}</p>
          <p style="margin: 0 0 8px;"><strong>Rental dates:</strong> ${dateRange}</p>
          <p style="margin: 0 0 8px;"><strong>Total days:</strong> ${input.totalDays}</p>
          <p style="margin: 0 0 8px;"><strong>Total amount:</strong> ${formatCurrency(input.totalPrice)}</p>
          <p style="margin: 0;"><strong>Payment method:</strong> ${input.paymentMethod}</p>
        </div>
        <p style="margin-top: 14px;">Thank you for booking with VRS.</p>
      </div>
    `,
  });
}

export async function sendAdminBookingCreatedEmail(
  input: Omit<BookingCreatedEmailInput, "to">,
) {
  const adminEmail = getAdminEmail();
  if (!adminEmail) {
    return;
  }

  const resend = getResendClient();
  const from = process.env.RESEND_FROM_EMAIL || DEFAULT_FROM;
  const dateRange = `${formatDate(input.startDate)} - ${formatDate(input.endDate)}`;

  await resend.emails.send({
    from,
    to: adminEmail,
    subject: `Admin notice: booking created (${input.bookingId})`,
    text: [
      "A new booking was created.",
      `Booking ID: ${input.bookingId}`,
      `Customer: ${input.customerName || "Unknown"}`,
      `Customer email: ${input.customerEmail || "Unknown"}`,
      `Vehicle: ${input.vehicleName}`,
      `Rental dates: ${dateRange}`,
      `Total days: ${input.totalDays}`,
      `Total amount: ${formatCurrency(input.totalPrice)}`,
      `Payment method: ${input.paymentMethod}`,
    ].join("\n"),
    html: `
      <div style="font-family: Arial, sans-serif; color: #111; line-height: 1.5;">
        <p>A new booking was created.</p>
        <div style="padding: 12px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <p style="margin: 0 0 8px;"><strong>Booking ID:</strong> ${input.bookingId}</p>
          <p style="margin: 0 0 8px;"><strong>Customer:</strong> ${input.customerName || "Unknown"}</p>
          <p style="margin: 0 0 8px;"><strong>Customer email:</strong> ${input.customerEmail || "Unknown"}</p>
          <p style="margin: 0 0 8px;"><strong>Vehicle:</strong> ${input.vehicleName}</p>
          <p style="margin: 0 0 8px;"><strong>Rental dates:</strong> ${dateRange}</p>
          <p style="margin: 0 0 8px;"><strong>Total days:</strong> ${input.totalDays}</p>
          <p style="margin: 0 0 8px;"><strong>Total amount:</strong> ${formatCurrency(input.totalPrice)}</p>
          <p style="margin: 0;"><strong>Payment method:</strong> ${input.paymentMethod}</p>
        </div>
      </div>
    `,
  });
}

export async function sendBookingCancelledEmail(input: BookingCancelledEmailInput) {
  const resend = getResendClient();
  const from = process.env.RESEND_FROM_EMAIL || DEFAULT_FROM;

  const dateRange = `${formatDate(input.startDate)} - ${formatDate(input.endDate)}`;
  const reasonText = input.cancellationReason?.trim() || "Not provided";
  const refundText = input.isPaid
    ? input.refundStatus === "Processed"
      ? `Processed (${formatCurrency(input.refundAmount || 0)})`
      : input.refundStatus || "Pending"
    : "Not applicable (unpaid booking)";

  await resend.emails.send({
    from,
    to: input.to,
    subject: `Booking cancelled: ${input.vehicleName}`,
    text: [
      greeting(input.customerName),
      "",
      "Your booking has been cancelled.",
      `Booking ID: ${input.bookingId}`,
      `Vehicle: ${input.vehicleName}`,
      `Rental dates: ${dateRange}`,
      `Total days: ${input.totalDays}`,
      `Total amount: ${formatCurrency(input.totalPrice)}`,
      `Cancellation reason: ${reasonText}`,
      `Refund status: ${refundText}`,
      "",
      "If you did not request this cancellation, please contact support.",
    ].join("\n"),
    html: `
      <div style="font-family: Arial, sans-serif; color: #111; line-height: 1.5;">
        <p>${greeting(input.customerName)}</p>
        <p>Your booking has been cancelled.</p>
        <div style="padding: 12px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <p style="margin: 0 0 8px;"><strong>Booking ID:</strong> ${input.bookingId}</p>
          <p style="margin: 0 0 8px;"><strong>Vehicle:</strong> ${input.vehicleName}</p>
          <p style="margin: 0 0 8px;"><strong>Rental dates:</strong> ${dateRange}</p>
          <p style="margin: 0 0 8px;"><strong>Total days:</strong> ${input.totalDays}</p>
          <p style="margin: 0 0 8px;"><strong>Total amount:</strong> ${formatCurrency(input.totalPrice)}</p>
          <p style="margin: 0 0 8px;"><strong>Cancellation reason:</strong> ${reasonText}</p>
          <p style="margin: 0;"><strong>Refund status:</strong> ${refundText}</p>
        </div>
        <p style="margin-top: 14px;">If you did not request this cancellation, please contact support.</p>
      </div>
    `,
  });
}

export async function sendAdminBookingCancelledEmail(
  input: Omit<BookingCancelledEmailInput, "to">,
) {
  const adminEmail = getAdminEmail();
  if (!adminEmail) {
    return;
  }

  const resend = getResendClient();
  const from = process.env.RESEND_FROM_EMAIL || DEFAULT_FROM;

  const dateRange = `${formatDate(input.startDate)} - ${formatDate(input.endDate)}`;
  const reasonText = input.cancellationReason?.trim() || "Not provided";
  const refundText = input.isPaid
    ? input.refundStatus === "Processed"
      ? `Processed (${formatCurrency(input.refundAmount || 0)})`
      : input.refundStatus || "Pending"
    : "Not applicable (unpaid booking)";

  await resend.emails.send({
    from,
    to: adminEmail,
    subject: `Admin notice: booking cancelled (${input.bookingId})`,
    text: [
      "A booking was cancelled.",
      `Booking ID: ${input.bookingId}`,
      `Customer: ${input.customerName || "Unknown"}`,
      `Customer email: ${input.customerEmail || "Unknown"}`,
      `Vehicle: ${input.vehicleName}`,
      `Rental dates: ${dateRange}`,
      `Total days: ${input.totalDays}`,
      `Total amount: ${formatCurrency(input.totalPrice)}`,
      `Cancellation reason: ${reasonText}`,
      `Refund status: ${refundText}`,
    ].join("\n"),
    html: `
      <div style="font-family: Arial, sans-serif; color: #111; line-height: 1.5;">
        <p>A booking was cancelled.</p>
        <div style="padding: 12px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <p style="margin: 0 0 8px;"><strong>Booking ID:</strong> ${input.bookingId}</p>
          <p style="margin: 0 0 8px;"><strong>Customer:</strong> ${input.customerName || "Unknown"}</p>
          <p style="margin: 0 0 8px;"><strong>Customer email:</strong> ${input.customerEmail || "Unknown"}</p>
          <p style="margin: 0 0 8px;"><strong>Vehicle:</strong> ${input.vehicleName}</p>
          <p style="margin: 0 0 8px;"><strong>Rental dates:</strong> ${dateRange}</p>
          <p style="margin: 0 0 8px;"><strong>Total days:</strong> ${input.totalDays}</p>
          <p style="margin: 0 0 8px;"><strong>Total amount:</strong> ${formatCurrency(input.totalPrice)}</p>
          <p style="margin: 0 0 8px;"><strong>Cancellation reason:</strong> ${reasonText}</p>
          <p style="margin: 0;"><strong>Refund status:</strong> ${refundText}</p>
        </div>
      </div>
    `,
  });
}

export async function sendBookingStatusChangedByAdminEmail(
  input: AdminBookingStatusChangedEmailInput,
) {
  const resend = getResendClient();
  const from = process.env.RESEND_FROM_EMAIL || DEFAULT_FROM;

  const dateRange = `${formatDate(input.startDate)} - ${formatDate(input.endDate)}`;
  const reasonText = input.reason?.trim() || "Not provided";

  await resend.emails.send({
    from,
    to: input.to,
    subject: `Booking updated by admin: ${input.newStatus} (${input.bookingId})`,
    text: [
      greeting(input.customerName),
      "",
      `Your booking status was updated by an admin to: ${input.newStatus}.`,
      `Booking ID: ${input.bookingId}`,
      `Vehicle: ${input.vehicleName}`,
      `Rental dates: ${dateRange}`,
      `Total days: ${input.totalDays}`,
      `Total amount: ${formatCurrency(input.totalPrice)}`,
      `Admin note: ${reasonText}`,
      "",
      "If you have questions, please contact support.",
    ].join("\n"),
    html: `
      <div style="font-family: Arial, sans-serif; color: #111; line-height: 1.5;">
        <p>${greeting(input.customerName)}</p>
        <p>Your booking status was updated by an admin to: <strong>${input.newStatus}</strong>.</p>
        <div style="padding: 12px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <p style="margin: 0 0 8px;"><strong>Booking ID:</strong> ${input.bookingId}</p>
          <p style="margin: 0 0 8px;"><strong>Vehicle:</strong> ${input.vehicleName}</p>
          <p style="margin: 0 0 8px;"><strong>Rental dates:</strong> ${dateRange}</p>
          <p style="margin: 0 0 8px;"><strong>Total days:</strong> ${input.totalDays}</p>
          <p style="margin: 0 0 8px;"><strong>Total amount:</strong> ${formatCurrency(input.totalPrice)}</p>
          <p style="margin: 0;"><strong>Admin note:</strong> ${reasonText}</p>
        </div>
        <p style="margin-top: 14px;">If you have questions, please contact support.</p>
      </div>
    `,
  });
}

export async function sendAdminBookingStatusChangedEmail(
  input: Omit<AdminBookingStatusChangedEmailInput, "to">,
) {
  const adminEmail = getAdminEmail();
  if (!adminEmail) {
    return;
  }

  const resend = getResendClient();
  const from = process.env.RESEND_FROM_EMAIL || DEFAULT_FROM;

  const dateRange = `${formatDate(input.startDate)} - ${formatDate(input.endDate)}`;
  const reasonText = input.reason?.trim() || "Not provided";

  await resend.emails.send({
    from,
    to: adminEmail,
    subject: `Admin notice: booking ${input.newStatus.toLowerCase()} (${input.bookingId})`,
    text: [
      `A booking was marked as ${input.newStatus} by an admin.`,
      `Booking ID: ${input.bookingId}`,
      `Customer: ${input.customerName || "Unknown"}`,
      `Customer email: ${input.customerEmail || "Unknown"}`,
      `Vehicle: ${input.vehicleName}`,
      `Rental dates: ${dateRange}`,
      `Total days: ${input.totalDays}`,
      `Total amount: ${formatCurrency(input.totalPrice)}`,
      `Admin note: ${reasonText}`,
    ].join("\n"),
    html: `
      <div style="font-family: Arial, sans-serif; color: #111; line-height: 1.5;">
        <p>A booking was marked as <strong>${input.newStatus}</strong> by an admin.</p>
        <div style="padding: 12px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <p style="margin: 0 0 8px;"><strong>Booking ID:</strong> ${input.bookingId}</p>
          <p style="margin: 0 0 8px;"><strong>Customer:</strong> ${input.customerName || "Unknown"}</p>
          <p style="margin: 0 0 8px;"><strong>Customer email:</strong> ${input.customerEmail || "Unknown"}</p>
          <p style="margin: 0 0 8px;"><strong>Vehicle:</strong> ${input.vehicleName}</p>
          <p style="margin: 0 0 8px;"><strong>Rental dates:</strong> ${dateRange}</p>
          <p style="margin: 0 0 8px;"><strong>Total days:</strong> ${input.totalDays}</p>
          <p style="margin: 0 0 8px;"><strong>Total amount:</strong> ${formatCurrency(input.totalPrice)}</p>
          <p style="margin: 0;"><strong>Admin note:</strong> ${reasonText}</p>
        </div>
      </div>
    `,
  });
}