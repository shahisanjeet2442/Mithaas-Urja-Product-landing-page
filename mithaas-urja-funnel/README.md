# Mithaas Urja COD Funnel

This project is a premium Cash On Delivery sales funnel built with Next.js App Router and Tailwind CSS.
It now supports a multi-product D2C storefront with a centralized site config and official logo placement.

## Included

- Premium product landing page at `/`
- Checkout page at `/checkout`
- Thank you page at `/thank-you`
- Order submission API at `/api/order`
- Google Sheets order logging
- Gmail/SMTP order notifications
- Customer order confirmation email
- Mobile-first premium UI

## Tech Stack

- Next.js App Router
- React 19
- Tailwind CSS
- Framer Motion
- Zod for validation
- Google Sheets API via service account JWT
- Email delivery via `nodemailer`

## How the order flow works

1. The customer selects a product and quantity on the landing page.
2. CTA buttons send the selected product data to `/checkout`.
3. The checkout form sends a `POST` request to `/api/order`.
4. The API validates the payload, generates an Order ID, and creates a timestamp.
5. The order is appended to Google Sheets.
6. The business inbox receives an order notification email.
7. The customer receives an order received confirmation email.
8. The customer is redirected to `/thank-you` after success.

## Environment Variables

Create a `.env.local` file from `.env.example` and fill in:

- `NEXT_PUBLIC_SITE_URL`
- `BUSINESS_EMAIL`
- `EMAIL_FROM`
- `BRAND_NAME`
- `GOOGLE_SHEET_ID`
- `GOOGLE_SHEET_TAB_NAME`
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `GOOGLE_PRIVATE_KEY`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `EMAIL_SERVICE_API_KEY`
- `FRONTEND_URL`

## Google Spreadsheet setup

1. Create a Google Sheet.
2. Add these headers in row 1:
   - `Order Number`
   - `Date`
   - `Time`
   - `Customer Name`
   - `Phone`
   - `Alternative Phone`
   - `Province`
   - `District`
   - `Address`
   - `Selected Product`
   - `Quantity`
   - `Price`
   - `Discount`
   - `Delivery Charge`
   - `Grand Total`
   - `Payment Method`
3. Add filters to the header row.
4. For a premium look, format the sheet like this:
   - Freeze row 1.
   - Use a deep green or dark brown header fill with white bold text.
   - Apply alternating row colors for readability.
   - Set the amount columns to currency format.
   - Use a subtle border or banded rows.
   - Widen the product, address, and customer columns so the sheet breathes.
   - Keep the first row visually distinct so it feels like a branded dashboard.
5. If you want manual management, add your own dropdown columns beside the order data for statuses such as:
   - `New Order`
   - `Order Confirmed`
   - `Order Ongoing`
   - `Delivered`
   - `Cancelled`
6. Copy the Sheet ID from the URL.
7. Share the sheet with `GOOGLE_SERVICE_ACCOUNT_EMAIL`.
8. Paste the Sheet ID and credentials into `.env.local`.
9. Set `GOOGLE_SHEET_TAB_NAME=sheet 1` if you want to match your current tab name exactly.

## Email setup

This project uses SMTP through Nodemailer.

Recommended Gmail SMTP values:

- `SMTP_HOST=smtp.gmail.com`
- `SMTP_PORT=465`
- `SMTP_USER=yourgmail@gmail.com`
- `SMTP_PASS=your app password`

Notes:

- `EMAIL_FROM` should usually be the same Gmail address or a verified sender.
- `BUSINESS_EMAIL` is the inbox that receives customer orders.
- The official logo is loaded from `public/logo.png`. Replace that file if you ever update the brand mark.

## Testing order submission

1. Start the app with `npm run dev`.
2. Open `/`.
3. Pick a product and quantity, then click `Order Now` or `Purchase Now`.
4. Fill out the checkout form.
5. Submit the order.
6. Confirm:
   - A new row is added in Google Sheets.
   - Your business inbox receives the admin email.
   - The customer inbox receives the confirmation email.
   - The browser redirects to `/thank-you`.

## Deploying on Vercel

1. Push the project to GitHub.
2. Import the repo into Vercel.
3. Add all environment variables in the Vercel project settings.
4. Set `NEXT_PUBLIC_SITE_URL` and `FRONTEND_URL` to your live domain.
5. Deploy.

## Notes

- The reels section is not shown because no reel links were provided.
- Product content, testimonials, FAQs, pricing, delivery rules, and social links are centralized in `src/data/site.ts` for easy editing.
Deployment configuration updated.
