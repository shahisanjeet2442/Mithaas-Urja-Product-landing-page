import { google } from "googleapis";
import { siteConfig } from "@/data/site";

export type SheetOrder = {
  orderId: string;
  orderDate: string;
  orderTime: string;
  customerName: string;
  phoneNumber: string;
  alternativePhone: string;
  province: string;
  district: string;
  address: string;
  selectedProduct: string;
  quantity: number;
  pricePerPiece: number;
  discount: number;
  deliveryCharge: number;
  grandTotal: number;
  paymentMethod: string;
};

export class OrderPipelineError extends Error {
  stage: "google_auth" | "google_append";

  constructor(stage: "google_auth" | "google_append", message: string) {
    super(message);
    this.name = "OrderPipelineError";
    this.stage = stage;
  }
}

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. Add it to your .env file before submitting orders.`
    );
  }
  return value;
}

function normalizeServiceAccountEmail(value: string) {
  return value.trim().replace(/^["']|["']$/g, "");
}

function normalizePrivateKey(value: string) {
  const trimmed = value.trim().replace(/^["']|["']$/g, "");
  const withNewLines = trimmed.replace(/\\n/g, "\n");

  if (!withNewLines.includes("BEGIN PRIVATE KEY")) {
    throw new Error(
      "GOOGLE_PRIVATE_KEY must include the BEGIN PRIVATE KEY header. Re-paste the full service-account private key into .env.local."
    );
  }

  if (!withNewLines.includes("END PRIVATE KEY")) {
    throw new Error(
      "GOOGLE_PRIVATE_KEY must include the END PRIVATE KEY footer. Re-paste the full service-account private key into .env.local."
    );
  }

  return withNewLines;
}

function buildSheetsClient() {
  const clientEmail = normalizeServiceAccountEmail(requireEnv("GOOGLE_SERVICE_ACCOUNT_EMAIL"));
  const privateKey = normalizePrivateKey(requireEnv("GOOGLE_PRIVATE_KEY"));
  console.info(
    `[sheets] building JWT client: ${JSON.stringify({
      clientEmail,
      hasPrivateKey: Boolean(privateKey),
      scope: "https://www.googleapis.com/auth/spreadsheets",
    })}`
  );

  return new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

export async function appendOrderToSheet(order: SheetOrder) {
  const spreadsheetId = requireEnv("GOOGLE_SHEET_ID");
  const sheetName = process.env.GOOGLE_SHEET_TAB_NAME || "Orders";
  const range = `'${sheetName}'!A:P`;
  const auth = buildSheetsClient();

  console.info(
    `[sheets] append requested: ${JSON.stringify({
      spreadsheetId: "[set]",
      sheetName,
      range,
      orderId: order.orderId,
    })}`
  );

  try {
    console.info(`[sheets] authorizing service account: ${order.orderId}`);
    await auth.authorize();
    console.info(`[sheets] authorization successful: ${order.orderId}`);
  } catch (error) {
    console.error(
      `[sheets] authorization failed: ${JSON.stringify({
        orderId: order.orderId,
        message: error instanceof Error ? error.message : String(error),
      })}`
    );
    throw new OrderPipelineError(
      "google_auth",
      error instanceof Error ? error.message : "Google authorization failed."
    );
  }

  const sheets = google.sheets({ version: "v4", auth });
  const rows = [
    [
      order.orderId,
      order.orderDate,
      order.orderTime,
      order.customerName,
      order.phoneNumber,
      order.alternativePhone,
      order.province,
      order.district,
      order.address,
      order.selectedProduct,
      order.quantity,
      order.pricePerPiece,
      order.discount,
      order.deliveryCharge,
      order.grandTotal,
      order.paymentMethod,
    ],
  ];

  console.info(
    `[sheets] spreadsheets.values.append executing: ${JSON.stringify({
      spreadsheetId,
      sheetName,
      range,
      rowCount: rows.length,
      columnCount: rows[0].length,
      orderId: order.orderId,
    })}`
  );

  try {
    const result = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      requestBody: { values: rows },
    });

    console.info(
      `[sheets] append successful: ${JSON.stringify({
        orderId: order.orderId,
        updatedRange: result.data.updates?.updatedRange || null,
        updatedRows: result.data.updates?.updatedRows || null,
        updatedCells: result.data.updates?.updatedCells || null,
      })}`
    );

    return {
      spreadsheetId,
      sheetName,
      brandName: siteConfig.brandName,
      updatedRange: result.data.updates?.updatedRange || null,
    };
  } catch (error) {
    console.error(
      `[sheets] append failed: ${JSON.stringify({
        orderId: order.orderId,
        spreadsheetId,
        sheetName,
        range,
        message: error instanceof Error ? error.message : String(error),
      })}`
    );
    throw new OrderPipelineError(
      "google_append",
      error instanceof Error ? error.message : "Google Sheets append failed."
    );
  }
}
