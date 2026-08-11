import { NextRequest, NextResponse } from "next/server";
import { appendOrderToSheet } from "@/lib/google-sheets";
import { sendOrderEmails } from "@/lib/email";
import {
  calculatePricing,
  createOrderId,
  formatDateTime,
} from "@/lib/format";
import { checkoutSubmissionSchema } from "@/lib/validation";
import { siteConfig } from "@/data/site";
import { OrderPipelineError as SheetsPipelineError } from "@/lib/google-sheets";
import { OrderPipelineError as EmailPipelineError } from "@/lib/email";

function isAllowedOrigin(origin: string | null) {
  const allowedOrigins = [
    process.env.FRONTEND_URL,
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
  ].filter(Boolean) as string[];

  if (!origin || allowedOrigins.length === 0) {
    return true;
  }

  return allowedOrigins.includes(origin);
}

function getDateParts(date = new Date()) {
  const orderDate = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Asia/Kathmandu",
  }).format(date);

  const orderTime = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kathmandu",
  }).format(date);

  return { orderDate, orderTime };
}

export async function POST(request: NextRequest) {
  try {
    console.info("[order] incoming request");
    if (!isAllowedOrigin(request.headers.get("origin"))) {
      console.warn(`[order] blocked origin: ${request.headers.get("origin") ?? "null"}`);
      return NextResponse.json(
        { success: false, message: "Origin not allowed." },
        { status: 403 }
      );
    }

    const body = await request.json();
    console.info(
      `[order] raw body received: ${JSON.stringify({
        hasFullName: Boolean(body?.fullName),
        hasEmail: Boolean(body?.email),
        productId: body?.productId,
        quantity: body?.quantity,
      })}`
    );
    const parsed = checkoutSubmissionSchema.parse(body);
    const pricing = calculatePricing(
      parsed.quantity,
      parsed.pricePerPiece,
      siteConfig.delivery.normalFee
    );
    const orderId = createOrderId();
    const { orderDate, orderTime } = getDateParts();
    const paymentMethod = "Cash On Delivery";
    const orderStatus = "New Order";

    const order = {
      ...parsed,
      subtotal: pricing.subtotal,
      discount: pricing.discount,
      deliveryFee: pricing.deliveryFee,
      totalPrice: pricing.totalPrice,
      orderId,
      orderDate,
      orderTime,
      paymentMethod,
      orderStatus,
      notes: parsed.notes || "",
    };

    console.info(
      `[order] parsed and priced: ${JSON.stringify({
        orderId,
        productId: parsed.productId,
        productName: parsed.productName,
        flavor: parsed.flavor,
        quantity: parsed.quantity,
        subtotal: pricing.subtotal,
        discount: pricing.discount,
        deliveryFee: pricing.deliveryFee,
        totalPrice: pricing.totalPrice,
      })}`
    );

    const sheetOrder = {
      orderId,
      orderDate,
      orderTime,
      customerName: order.fullName,
      phoneNumber: order.phoneNumber,
      alternativePhone: order.alternativePhone || "",
      province: order.province || "",
      district: order.district || "",
      address: order.location,
      selectedProduct: `${order.productName}${order.flavor ? ` - ${order.flavor}` : ""}`,
      quantity: order.quantity,
      pricePerPiece: order.pricePerPiece,
      discount: order.discount,
      deliveryCharge: order.deliveryFee,
      grandTotal: order.totalPrice,
      paymentMethod: order.paymentMethod,
    }

    console.info(
      `[order] appending row to Google Sheets: ${JSON.stringify({
        sheetId: process.env.GOOGLE_SHEET_ID ? "[set]" : "[missing]",
        sheetTab: process.env.GOOGLE_SHEET_TAB_NAME || "Orders",
        orderId,
      })}`
    );
    await appendOrderToSheet(sheetOrder);
    console.info(`[order] google sheets append complete: ${orderId}`);

    console.info(
      `[order] sending notification emails: ${JSON.stringify({
        businessEmail: process.env.BUSINESS_EMAIL ? "[set]" : "[missing]",
        customerEmail: order.email,
        orderId,
      })}`
    );
    await sendOrderEmails(order);
    console.info(`[order] email notifications complete: ${orderId}`);

    return NextResponse.json({
      success: true,
      orderId,
      syncStatus: "synced",
      message: "Order submitted successfully.",
      brandName: siteConfig.brandName,
      dateTime: formatDateTime(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to submit order.";
    const stage =
      error instanceof SheetsPipelineError || error instanceof EmailPipelineError
        ? error.stage
        : "order_submission";

    console.error(
      `[order] submission failed: ${JSON.stringify({
        stage,
        message,
        stack: error instanceof Error ? error.stack : undefined,
      })}`
    );
    return NextResponse.json(
      {
        success: false,
        stage,
        message,
      },
      { status: 400 }
    );
  }
}
