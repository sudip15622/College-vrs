import { NextRequest, NextResponse } from "next/server";
import { handlePaymentCallback } from "@/lib/actions/payment";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const pidx = searchParams.get("pidx");
    const bookingId = searchParams.get("booking_id");
    const txnId = searchParams.get("transaction_id");
    const amount = searchParams.get("amount");
    const mobile = searchParams.get("mobile");
    const purchaseOrderId = searchParams.get("purchase_order_id");
    const purchaseOrderName = searchParams.get("purchase_order_name");

    // Validate required parameters
    if (!pidx || !bookingId) {
      return NextResponse.redirect(
        new URL(`/book/failure?error=missing_params`, request.url)
      );
    }

    // Verify payment with Khalti
    const result = await handlePaymentCallback(pidx, bookingId);

    if (result.success) {
      // Redirect to success page
      return NextResponse.redirect(
        new URL(`/book/success?booking_id=${bookingId}`, request.url)
      );
    } else {
      // Redirect to failure page
      return NextResponse.redirect(
        new URL(`/book/failure?booking_id=${bookingId}`, request.url)
      );
    }
  } catch (error) {
    console.error("Payment callback error:", error);
    return NextResponse.redirect(
      new URL(`/book/failure?error=server_error`, request.url)
    );
  }
}
