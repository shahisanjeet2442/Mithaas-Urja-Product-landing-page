import { google } from "googleapis";
import { siteConfig } from "@/data/site";

const SHEET_HEADERS = [
  "Order ID",
  "Date",
  "Time",
  "Customer Name",
  "Phone Number",
  "Alternative Phone",
  "Province",
  "District",
  "Address",
  "Selected Product",
  "Quantity",
  "Price Per Piece",
  "Discount",
  "Delivery Charge",
  "Grand Total",
  "Payment Method",
];

const SHEET_COLUMN_COUNT = SHEET_HEADERS.length;
const SHEET_LAST_COLUMN = "P";

type SheetDetails = {
  sheetId: number;
  bandedRangeIds: number[];
};

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

function hexToRgbColor(hex: string) {
  const normalized = hex.replace("#", "");
  const red = Number.parseInt(normalized.slice(0, 2), 16) / 255;
  const green = Number.parseInt(normalized.slice(2, 4), 16) / 255;
  const blue = Number.parseInt(normalized.slice(4, 6), 16) / 255;

  return { red, green, blue };
}

function buildHeaderRow() {
  return [
    {
      values: SHEET_HEADERS.map((header) => ({
        userEnteredValue: { stringValue: header },
      })),
    },
  ];
}

async function getSheetDetails(
  sheets: ReturnType<typeof google.sheets>,
  spreadsheetId: string,
  sheetName: string
): Promise<SheetDetails> {
  const metadata = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: "sheets(properties(sheetId,title),bandedRanges(bandedRangeId))",
  });

  const sheet = metadata.data.sheets?.find((entry) => entry.properties?.title === sheetName);

  if (!sheet?.properties?.sheetId) {
    throw new Error(`Could not find sheet tab named "${sheetName}".`);
  }

  return {
    sheetId: sheet.properties.sheetId,
    bandedRangeIds:
      sheet.bandedRanges
        ?.map((bandedRange) => bandedRange.bandedRangeId)
        .filter((bandedRangeId): bandedRangeId is number => typeof bandedRangeId === "number") ?? [],
  };
}

async function ensureHeaderRow(
  sheets: ReturnType<typeof google.sheets>,
  spreadsheetId: string,
  sheetId: number,
  sheetName: string
) {
  const headerResponse = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `'${sheetName}'!A1:${SHEET_LAST_COLUMN}1`,
    majorDimension: "ROWS",
  });

  const firstRow = headerResponse.data.values?.[0]?.map((cell) => String(cell).trim()) ?? [];
  const hasExpectedHeader = SHEET_HEADERS.every((header, index) => firstRow[index] === header);

  if (hasExpectedHeader) {
    return false;
  }

  console.info(`[sheets] inserting professional header row for ${sheetName}`);

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          insertDimension: {
            range: {
              sheetId,
              dimension: "ROWS",
              startIndex: 0,
              endIndex: 1,
            },
            inheritFromBefore: false,
          },
        },
        {
          updateCells: {
            start: {
              sheetId,
              rowIndex: 0,
              columnIndex: 0,
            },
            rows: buildHeaderRow(),
            fields: "userEnteredValue",
          },
        },
      ],
    },
  });

  return true;
}

async function applyProfessionalFormatting(
  sheets: ReturnType<typeof google.sheets>,
  spreadsheetId: string,
  sheetId: number,
  sheetName: string,
  bandedRangeIds: number[]
) {
  const valuesResponse = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `'${sheetName}'!A1:${SHEET_LAST_COLUMN}`,
    majorDimension: "ROWS",
  });

  const rowCount = Math.max(valuesResponse.data.values?.length ?? 0, 1);
  const bandingFillOne = hexToRgbColor("#fff8ee");
  const bandingFillTwo = hexToRgbColor("#f6fbf8");
  const headerFill = hexToRgbColor("#2d6a4f");
  const headerText = hexToRgbColor("#ffffff");
  const accentFill = hexToRgbColor("#fff0d1");
  const borderColor = hexToRgbColor("#d9e6dc");
  const innerBorderColor = hexToRgbColor("#e8eee9");
  const textColor = hexToRgbColor("#2d2d2d");

  const requests: any[] = [
    {
      updateSheetProperties: {
        properties: {
          sheetId,
          gridProperties: {
            frozenRowCount: 1,
          },
        },
        fields: "gridProperties.frozenRowCount",
      },
    },
    {
      updateDimensionProperties: {
        range: {
          sheetId,
          dimension: "ROWS",
          startIndex: 0,
          endIndex: 1,
        },
        properties: {
          pixelSize: 44,
        },
        fields: "pixelSize",
      },
    },
  ];

  if (rowCount > 1) {
    requests.push({
      updateDimensionProperties: {
        range: {
          sheetId,
          dimension: "ROWS",
          startIndex: 1,
          endIndex: rowCount,
        },
        properties: {
          pixelSize: 34,
        },
        fields: "pixelSize",
      },
    });
  }

  const columnWidths = [150, 110, 100, 180, 135, 145, 115, 115, 260, 190, 90, 140, 120, 140, 145, 145];

  columnWidths.forEach((pixelSize, index) => {
    requests.push({
      updateDimensionProperties: {
        range: {
          sheetId,
          dimension: "COLUMNS",
          startIndex: index,
          endIndex: index + 1,
        },
        properties: {
          pixelSize,
        },
        fields: "pixelSize",
      },
    });
  });

  requests.push(
    {
      repeatCell: {
        range: {
          sheetId,
          startRowIndex: 0,
          endRowIndex: rowCount,
          startColumnIndex: 0,
          endColumnIndex: SHEET_COLUMN_COUNT,
        },
        cell: {
          userEnteredFormat: {
            textFormat: {
              fontFamily: "Inter",
              fontSize: 11,
              foregroundColor: textColor,
            },
            verticalAlignment: "MIDDLE",
            borders: {
              top: { style: "SOLID", color: borderColor },
              bottom: { style: "SOLID", color: borderColor },
              left: { style: "SOLID", color: borderColor },
              right: { style: "SOLID", color: borderColor },
              innerHorizontal: { style: "SOLID", color: innerBorderColor },
              innerVertical: { style: "SOLID", color: innerBorderColor },
            },
          },
        },
        fields: "userEnteredFormat(textFormat,verticalAlignment,borders)",
      },
    },
    {
      repeatCell: {
        range: {
          sheetId,
          startRowIndex: 0,
          endRowIndex: 1,
          startColumnIndex: 0,
          endColumnIndex: SHEET_COLUMN_COUNT,
        },
        cell: {
          userEnteredFormat: {
            backgroundColor: headerFill,
            horizontalAlignment: "CENTER",
            verticalAlignment: "MIDDLE",
            textFormat: {
              bold: true,
              fontFamily: "Inter",
              fontSize: 12,
              foregroundColor: headerText,
            },
            borders: {
              top: { style: "SOLID", color: headerFill },
              bottom: { style: "SOLID", color: headerFill },
              left: { style: "SOLID", color: headerFill },
              right: { style: "SOLID", color: headerFill },
            },
          },
        },
        fields: "userEnteredFormat(backgroundColor,horizontalAlignment,verticalAlignment,textFormat,borders)",
      },
    }
  );

  if (rowCount > 1) {
    requests.push(
      {
        repeatCell: {
          range: {
            sheetId,
            startRowIndex: 1,
            endRowIndex: rowCount,
            startColumnIndex: 0,
            endColumnIndex: 1,
          },
          cell: {
            userEnteredFormat: {
              horizontalAlignment: "LEFT",
              wrapStrategy: "WRAP",
            },
          },
          fields: "userEnteredFormat(horizontalAlignment,wrapStrategy)",
        },
      },
      {
        repeatCell: {
          range: {
            sheetId,
            startRowIndex: 1,
            endRowIndex: rowCount,
            startColumnIndex: 1,
            endColumnIndex: 3,
          },
          cell: {
            userEnteredFormat: {
              horizontalAlignment: "CENTER",
              numberFormat: { type: "TEXT" },
            },
          },
          fields: "userEnteredFormat(horizontalAlignment,numberFormat)",
        },
      },
      {
        repeatCell: {
          range: {
            sheetId,
            startRowIndex: 1,
            endRowIndex: rowCount,
            startColumnIndex: 3,
            endColumnIndex: 4,
          },
          cell: {
            userEnteredFormat: {
              horizontalAlignment: "LEFT",
              wrapStrategy: "WRAP",
            },
          },
          fields: "userEnteredFormat(horizontalAlignment,wrapStrategy)",
        },
      },
      {
        repeatCell: {
          range: {
            sheetId,
            startRowIndex: 1,
            endRowIndex: rowCount,
            startColumnIndex: 4,
            endColumnIndex: 6,
          },
          cell: {
            userEnteredFormat: {
              horizontalAlignment: "CENTER",
              numberFormat: { type: "TEXT" },
            },
          },
          fields: "userEnteredFormat(horizontalAlignment,numberFormat)",
        },
      },
      {
        repeatCell: {
          range: {
            sheetId,
            startRowIndex: 1,
            endRowIndex: rowCount,
            startColumnIndex: 6,
            endColumnIndex: 9,
          },
          cell: {
            userEnteredFormat: {
              horizontalAlignment: "LEFT",
              wrapStrategy: "WRAP",
            },
          },
          fields: "userEnteredFormat(horizontalAlignment,wrapStrategy)",
        },
      },
      {
        repeatCell: {
          range: {
            sheetId,
            startRowIndex: 1,
            endRowIndex: rowCount,
            startColumnIndex: 9,
            endColumnIndex: 10,
          },
          cell: {
            userEnteredFormat: {
              horizontalAlignment: "LEFT",
              wrapStrategy: "WRAP",
            },
          },
          fields: "userEnteredFormat(horizontalAlignment,wrapStrategy)",
        },
      },
      {
        repeatCell: {
          range: {
            sheetId,
            startRowIndex: 1,
            endRowIndex: rowCount,
            startColumnIndex: 10,
            endColumnIndex: 11,
          },
          cell: {
            userEnteredFormat: {
              horizontalAlignment: "CENTER",
              numberFormat: { type: "NUMBER", pattern: "0" },
            },
          },
          fields: "userEnteredFormat(horizontalAlignment,numberFormat)",
        },
      },
      {
        repeatCell: {
          range: {
            sheetId,
            startRowIndex: 1,
            endRowIndex: rowCount,
            startColumnIndex: 11,
            endColumnIndex: 15,
          },
          cell: {
            userEnteredFormat: {
              horizontalAlignment: "RIGHT",
              numberFormat: { type: "CURRENCY", pattern: '"Rs."#,##0.00' },
            },
          },
          fields: "userEnteredFormat(horizontalAlignment,numberFormat)",
        },
      },
      {
        repeatCell: {
          range: {
            sheetId,
            startRowIndex: 1,
            endRowIndex: rowCount,
            startColumnIndex: 14,
            endColumnIndex: 15,
          },
          cell: {
            userEnteredFormat: {
              backgroundColor: accentFill,
              textFormat: {
                bold: true,
                foregroundColor: textColor,
              },
            },
          },
          fields: "userEnteredFormat(backgroundColor,textFormat)",
        },
      },
      {
        repeatCell: {
          range: {
            sheetId,
            startRowIndex: 1,
            endRowIndex: rowCount,
            startColumnIndex: 15,
            endColumnIndex: 16,
          },
          cell: {
            userEnteredFormat: {
              horizontalAlignment: "CENTER",
            },
          },
          fields: "userEnteredFormat(horizontalAlignment)",
        },
      }
    );
  }

  for (const bandedRangeId of bandedRangeIds) {
    requests.push({
      deleteBanding: {
        bandedRangeId,
      },
    });
  }

  requests.push({
    addBanding: {
      bandedRange: {
        range: {
          sheetId,
          startRowIndex: 0,
          endRowIndex: rowCount,
          startColumnIndex: 0,
          endColumnIndex: SHEET_COLUMN_COUNT,
        },
        rowProperties: {
          firstBandColor: bandingFillOne,
          secondBandColor: bandingFillTwo,
        },
        headerColor: headerFill,
      },
    },
  });

  console.info(
    `[sheets] applying presentation formatting: ${JSON.stringify({
      sheetName,
      rowCount,
      sheetId,
    })}`
  );

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests,
    },
  });
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
  let sheetDetails: SheetDetails | null = null;

  try {
    sheetDetails = await getSheetDetails(sheets, spreadsheetId, sheetName);
  } catch (error) {
    console.warn(
      `[sheets] could not read sheet metadata for formatting: ${JSON.stringify({
        orderId: order.orderId,
        message: error instanceof Error ? error.message : String(error),
      })}`
    );
  }

  if (sheetDetails) {
    try {
      await ensureHeaderRow(sheets, spreadsheetId, sheetDetails.sheetId, sheetName);
    } catch (error) {
      console.warn(
        `[sheets] header formatting skipped: ${JSON.stringify({
          orderId: order.orderId,
          message: error instanceof Error ? error.message : String(error),
        })}`
      );
    }
  }

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

    if (sheetDetails) {
      try {
        await applyProfessionalFormatting(
          sheets,
          spreadsheetId,
          sheetDetails.sheetId,
          sheetName,
          sheetDetails.bandedRangeIds
        );
      } catch (error) {
        console.warn(
          `[sheets] visual formatting skipped: ${JSON.stringify({
            orderId: order.orderId,
            message: error instanceof Error ? error.message : String(error),
          })}`
        );
      }
    }

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
