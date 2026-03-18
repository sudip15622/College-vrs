"use server";
import prisma from "@/prisma";
import axios from "axios";

const khaltiSecretKey = process.env.KHALTI_SECRET_KEY!;
const khaltiApiUrl = "https://dev.khalti.com/api/v2";
const khaltiRefundApiUrl = "https://dev.khalti.com/api";
const returnUrl = process.env.KHALTI_RETURN_URL!;
const websiteUrl = process.env.KHALTI_WEBSITE_URL!;

export async function initiateKhaltiPayment(bookingId: string) {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        listing: {
          select: {
            name: true,
          },
        },
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!booking) {
      throw new Error("Booking not found");
    }

    const amountInPaisa = booking.totalPrice * 100;

    const payload = {
      return_url: `${returnUrl}?booking_id=${bookingId}`,
      website_url: websiteUrl,
      amount: amountInPaisa,
      purchase_order_id: bookingId,
      purchase_order_name: `Booking: ${booking.listing.name}`,
      customer_info: {
        name: booking.user.name,
        email: booking.user.email,
        phone: booking.renterContactNumber,
      },
    };

    const response = await axios.post(
      `${khaltiApiUrl}/epayment/initiate/`,
      payload,
      {
        headers: {
          Authorization: `Key ${khaltiSecretKey}`,
          "Content-Type": "application/json",
        },
      },
    );

    return {
      success: true,
      payment_url: response.data.payment_url,
      pidx: response.data.pidx,
      expires_at: response.data.expires_at,
      expires_in: response.data.expires_in,
    };
  } catch (error: any) {
    console.error(
      "Khalti payment initiation error:",
      error.response?.data || error.message,
    );
    return {
      success: false,
      message: "Failed to initiate payment",
    };
  }
}

export async function verifyKhaltiPayment(pidx: string) {
  try {
    const response = await axios.post(
      `${khaltiApiUrl}/epayment/lookup/`,
      { pidx },
      {
        headers: {
          Authorization: `Key ${khaltiSecretKey}`,
          "Content-Type": "application/json",
        },
      },
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Khalti payment verification error:",
      error.response?.data || error.message,
    );
    return null;
  }
}

export async function refundKhaltiPaymentByPidx(pidx: string) {
  try {
    const paymentData = await verifyKhaltiPayment(pidx);

    if (!paymentData?.transaction_id) {
      return {
        success: false,
        message: "Transaction ID not found from Khalti lookup.",
      };
    }

    const transactionId = paymentData.transaction_id as string;

    const response = await axios.post(
      `${khaltiRefundApiUrl}/merchant-transaction/${transactionId}/refund/`,
      {},
      {
        headers: {
          Authorization: `Key ${khaltiSecretKey}`,
          "Content-Type": "application/json",
        },
      },
    );

    return {
      success: true,
      data: response.data,
    };
  } catch (error: any) {
    console.error(
      "Khalti refund error:",
      error.response?.data || error.message,
    );
    return {
      success: false,
      message: error.response?.data?.detail || "Failed to process refund",
    };
  }
}

export async function handlePaymentCallback(pidx: string, bookingId: string) {
  try {
    // Verify payment with Khalti
    const paymentData = await verifyKhaltiPayment(pidx);

    // Check if payment was successful
    if (paymentData.status === "Completed") {
      // Update booking status
      await prisma.booking.update({
        where: { id: bookingId },
        data: {
          isPaid: true,
          paidAt: new Date(),
          status: "Confirmed",
          khaltiPidx: pidx,
        },
      });

      return {
        success: true,
        message: "Payment verified and booking confirmed",
        data: paymentData,
      };
    } else {
      return {
        success: false,
        message: "Payment not completed",
        data: paymentData,
      };
    }
  } catch (error) {
    throw new Error("Payment verification failed");
  }
}
