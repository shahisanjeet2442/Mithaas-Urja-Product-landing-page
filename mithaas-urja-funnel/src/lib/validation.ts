import { z } from "zod";

export const checkoutSubmissionSchema = z.object({
  fullName: z.string().min(2, "Name is required."),
  phoneNumber: z.string().min(6, "Phone number is required."),
  alternativePhone: z.string().optional().default(""),
  email: z.string().email("Please enter a valid email address."),
  province: z.string().optional().default(""),
  district: z.string().optional().default(""),
  location: z.string().min(3, "Location is required."),
  productId: z.string().min(2, "Product selection is required."),
  productName: z.string().min(2, "Product name is required."),
  flavor: z.string().optional().default(""),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1."),
  pricePerPiece: z.coerce.number().positive("Price per piece must be valid."),
  subtotal: z.coerce.number().positive("Subtotal must be valid."),
  discount: z.coerce.number().min(0).default(0),
  deliveryFee: z.coerce.number().min(0).default(0),
  totalPrice: z.coerce.number().positive("Total price must be valid."),
  notes: z.string().optional().default(""),
});

export type CheckoutSubmission = z.infer<typeof checkoutSubmissionSchema>;
