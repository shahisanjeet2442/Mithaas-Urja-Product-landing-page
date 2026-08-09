import nodemailer from "nodemailer";
import { siteConfig } from "@/data/site";
import { escapeHtml, formatCurrency } from "@/lib/format";
import type { CheckoutSubmission } from "@/lib/validation";

type OrderEmailContext = CheckoutSubmission & {
  orderId: string;
  orderDate: string;
  orderTime: string;
  totalPrice: number;
  paymentMethod: string;
  orderStatus: string;
};

export class OrderPipelineError extends Error {
  stage: "smtp_verify" | "smtp_send";

  constructor(stage: "smtp_verify" | "smtp_send", message: string) {
    super(message);
    this.name = "OrderPipelineError";
    this.stage = stage;
  }
}

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function getTransporter() {
  const host = requireEnv("SMTP_HOST");
  const port = Number(requireEnv("SMTP_PORT"));
  const user = requireEnv("SMTP_USER");
  const pass = requireEnv("SMTP_PASS");

  console.info(
    `[email] building SMTP transporter: ${JSON.stringify({
      host,
      port,
      user,
      hasPassword: Boolean(pass),
    })}`
  );

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

function shell(title: string, body: string) {
  return `
    <div style="margin:0;padding:0;background:#fff7ed;font-family:Arial,Helvetica,sans-serif;">
      <div style="max-width:700px;margin:0 auto;padding:24px 16px;">
        <div style="background:linear-gradient(135deg,#f28c28 0%,#2d6a4f 100%);border-radius:28px;padding:1px;">
          <div style="background:#ffffff;border-radius:27px;overflow:hidden;">
            <div style="padding:28px 28px 18px;background:linear-gradient(180deg,#fff9f4 0%,#ffffff 100%);">
              <div style="display:inline-block;padding:8px 14px;border-radius:999px;background:#fff0da;color:#9a3412;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;">${escapeHtml(siteConfig.brandName)}</div>
              <h1 style="margin:16px 0 0;font-size:30px;line-height:1.15;color:#111827;">${escapeHtml(title)}</h1>
            </div>
            <div style="padding:0 28px 28px;color:#374151;font-size:15px;line-height:1.7;">${body}</div>
            <div style="padding:18px 28px;background:#fff7ed;color:#9a3412;font-size:12px;text-align:center;">
              Powered by ${escapeHtml(siteConfig.brandName)} order automation.
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function detailCard(title: string, rows: string[]) {
  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 16px;border:1px solid #f3e8d5;border-radius:18px;">
      <tr>
        <td style="padding:16px 18px;background:#fffaf3;">
          <div style="font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#c2410c;font-weight:700;margin-bottom:10px;">${escapeHtml(title)}</div>
          ${rows
            .map(
              (row) => `
                <div style="padding:8px 0;border-top:1px solid #f5e7d2;font-size:14px;color:#374151;">${row}</div>
              `
            )
            .join("")}
        </td>
      </tr>
    </table>
  `;
}

function row(label: string, value: string) {
  return `<strong style="color:#111827;">${escapeHtml(label)}:</strong> ${value}`;
}

function badge(text: string) {
  return `<span style="display:inline-block;padding:7px 12px;border-radius:999px;background:#16a34a;color:#ffffff;font-size:12px;font-weight:700;">${escapeHtml(text)}</span>`;
}

function adminEmailHtml(order: OrderEmailContext) {
  const body = `
    <p style="margin:0 0 16px;font-size:16px;color:#111827;font-weight:700;">A new order has been submitted through the COD funnel.</p>
    <div style="margin:0 0 18px;">${badge(order.orderStatus)}</div>
    <div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:18px;">
      <div style="padding:14px 16px;border-radius:16px;background:#fff7ed;border:1px solid #fed7aa;min-width:180px;"><div style="font-size:12px;color:#9a3412;text-transform:uppercase;letter-spacing:.08em;font-weight:700;">Order ID</div><div style="font-size:18px;font-weight:700;color:#111827;margin-top:6px;">${escapeHtml(order.orderId)}</div></div>
      <div style="padding:14px 16px;border-radius:16px;background:#fff7ed;border:1px solid #fed7aa;min-width:180px;"><div style="font-size:12px;color:#9a3412;text-transform:uppercase;letter-spacing:.08em;font-weight:700;">Date &amp; Time</div><div style="font-size:18px;font-weight:700;color:#111827;margin-top:6px;">${escapeHtml(`${order.orderDate} ${order.orderTime}`)}</div></div>
    </div>
    ${detailCard("Customer details", [
      row("Customer Name", escapeHtml(order.fullName)),
      row("Phone Number", escapeHtml(order.phoneNumber)),
      row("Alternative Phone", escapeHtml(order.alternativePhone || "—")),
      row("Email Address", `<a href="mailto:${escapeHtml(order.email)}" style="color:#c2410c;text-decoration:none;">${escapeHtml(order.email)}</a>`),
      row("Province", escapeHtml(order.province || "—")),
      row("District", escapeHtml(order.district || "—")),
      row("Address", escapeHtml(order.location)),
    ])}
    ${detailCard("Product details", [
      row("Selected Product", escapeHtml(order.productName)),
      row("Flavor", escapeHtml(order.flavor || "—")),
      row("Quantity", escapeHtml(String(order.quantity))),
      row("Price Per Piece", escapeHtml(formatCurrency(order.pricePerPiece))),
      row("Discount", escapeHtml(formatCurrency(order.discount))),
      row("Delivery Charge", escapeHtml(formatCurrency(order.deliveryFee))),
      row("Grand Total", `<strong>${escapeHtml(formatCurrency(order.totalPrice))}</strong>`),
    ])}
    ${detailCard("Payment details", [
      row("Payment Method", escapeHtml(order.paymentMethod)),
      row("Order Status", escapeHtml(order.orderStatus)),
    ])}
    <div style="background:#ffedd5;border:1px solid #fdba74;border-radius:18px;padding:18px;color:#9a3412;font-weight:700;">
      Please call the customer soon to confirm this order.
    </div>
  `;

  return shell(`New Product Order Received - ${order.orderId}`, body);
}

function customerEmailHtml(order: OrderEmailContext) {
  const body = `
    <p style="margin:0 0 16px;font-size:16px;color:#111827;">Hi ${escapeHtml(order.fullName)},</p>
    <p style="margin:0 0 18px;font-size:16px;color:#374151;">Thank you for your order. We have received it successfully and our team will review it shortly.</p>
    ${detailCard("Your order summary", [
      row("Order ID", escapeHtml(order.orderId)),
      row("Product", escapeHtml(order.productName)),
      row("Flavor", escapeHtml(order.flavor || "—")),
      row("Quantity", escapeHtml(String(order.quantity))),
      row("Total Price", `<strong>${escapeHtml(formatCurrency(order.totalPrice))}</strong>`),
      row("Payment Method", escapeHtml(order.paymentMethod)),
    ])}
    <div style="background:#fef3c7;border:1px solid #f59e0b;border-radius:18px;padding:18px;color:#92400e;font-weight:700;margin-bottom:18px;">
      Our sales representative will call you soon to confirm your order.
    </div>
    <p style="margin:0 0 8px;font-size:15px;color:#374151;">Support: <a href="mailto:${escapeHtml(siteConfig.supportEmail)}" style="color:#c2410c;text-decoration:none;">${escapeHtml(siteConfig.supportEmail)}</a></p>
    <p style="margin:0;font-size:15px;color:#374151;">Thank you,<br />${escapeHtml(siteConfig.brandName)}</p>
  `;

  return shell(`Your Order Has Been Received - ${siteConfig.brandName}`, body);
}

export async function sendOrderEmails(order: OrderEmailContext) {
  const transporter = getTransporter();
  const fromName = process.env.EMAIL_FROM || requireEnv("SMTP_USER");
  const brandName = process.env.BRAND_NAME || siteConfig.brandName;
  const sender = `${brandName} <${fromName}>`;
  const customerRecipient = order.email;
  const adminRecipient = process.env.BUSINESS_EMAIL || fromName;

  console.info(
    `[email] verifying SMTP transporter: ${JSON.stringify({
      sender,
      adminRecipient,
      customerRecipient,
      orderId: order.orderId,
    })}`
  );

  try {
    await transporter.verify();
    console.info(`[email] SMTP transporter verified: ${order.orderId}`);
  } catch (error) {
    console.error(
      `[email] SMTP verify failed: ${JSON.stringify({
        orderId: order.orderId,
        message: error instanceof Error ? error.message : String(error),
      })}`
    );
    throw new OrderPipelineError(
      "smtp_verify",
      error instanceof Error ? error.message : "SMTP verification failed."
    );
  }

  const adminMessage = {
    from: sender,
    to: adminRecipient,
    subject: `New Product Order Received - ${order.orderId}`,
    html: adminEmailHtml(order),
    replyTo: order.email,
  };

  const customerMessage = {
    from: sender,
    to: customerRecipient,
    subject: `Your Order Has Been Received - ${brandName}`,
    html: customerEmailHtml(order),
    replyTo: adminRecipient,
  };

  const [adminResult, customerResult] = await Promise.allSettled([
    transporter.sendMail(adminMessage),
    transporter.sendMail(customerMessage),
  ]);

  console.info(
    `[email] sendMail settled: ${JSON.stringify({
      orderId: order.orderId,
      adminStatus: adminResult.status,
      customerStatus: customerResult.status,
    })}`
  );

  const failures = [
    adminResult.status === "rejected"
      ? `Admin email failed: ${adminResult.reason instanceof Error ? adminResult.reason.message : String(adminResult.reason)}`
      : null,
    customerResult.status === "rejected"
      ? `Customer email failed: ${customerResult.reason instanceof Error ? customerResult.reason.message : String(customerResult.reason)}`
      : null,
  ].filter(Boolean);

  if (failures.length > 0) {
    console.error(
      `[email] send failure: ${JSON.stringify({
        orderId: order.orderId,
        failures,
      })}`
    );
    throw new OrderPipelineError("smtp_send", failures.join(" | "));
  }
}
