import { siteConfig } from "@/data/site";

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: siteConfig.currency,
    currencyDisplay: "narrowSymbol",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDateTime(date = new Date()) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kathmandu",
  }).format(date);
}

export function getDiscountAmount(subtotal: number, quantity: number) {
  const activeRule = [...siteConfig.discountRules]
    .sort((a, b) => b.minQuantity - a.minQuantity)
    .find((rule) => quantity >= rule.minQuantity);

  if (!activeRule) {
    return 0;
  }

  return Math.round((subtotal * activeRule.percentage) / 100);
}

export function getDeliveryFee(quantity: number) {
  return quantity >= siteConfig.delivery.freeDeliveryThreshold
    ? 0
    : siteConfig.delivery.normalFee;
}

export function calculatePricing(
  quantity: number,
  pricePerPiece: number,
  baseDeliveryFee: number = siteConfig.delivery.normalFee
) {
  const subtotal = quantity * pricePerPiece;
  const discount = getDiscountAmount(subtotal, quantity);
  const deliveryFee =
    quantity >= siteConfig.delivery.freeDeliveryThreshold ? 0 : baseDeliveryFee;
  const totalPrice = Math.max(0, subtotal - discount + deliveryFee);

  return {
    subtotal,
    discount,
    deliveryFee,
    totalPrice,
  };
}

export function buildCheckoutUrl(params: {
  productId?: string;
  productName: string;
  flavor?: string;
  quantity: number;
  pricePerPiece: number;
  deliveryFee?: number;
}) {
  const pricing = calculatePricing(
    params.quantity,
    params.pricePerPiece,
    params.deliveryFee ?? siteConfig.delivery.normalFee
  );

  const searchParams = new URLSearchParams({
    productId: params.productId ?? "",
    productName: params.productName,
    flavor: params.flavor ?? "",
    quantity: String(params.quantity),
    pricePerPiece: String(params.pricePerPiece),
    subtotal: String(pricing.subtotal),
    discount: String(pricing.discount),
    deliveryFee: String(pricing.deliveryFee),
    totalPrice: String(pricing.totalPrice),
  });

  return `/checkout?${searchParams.toString()}`;
}

export function createOrderId() {
  const datePart = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kathmandu",
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
  })
    .format(new Date())
    .replaceAll("/", "");

  const randomPart = crypto.randomUUID().split("-")[0].toUpperCase();
  return `MU-${datePart}-${randomPart}`;
}

export function escapeHtml(input: string) {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
