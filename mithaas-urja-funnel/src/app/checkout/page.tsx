import { Suspense } from "react";
import CheckoutPage from "@/components/checkout-page";

function LoadingState() {
  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl rounded-[36px] border border-white/70 bg-white/90 p-8 shadow-[0_30px_80px_rgba(120,53,15,0.1)]">
        Loading checkout...
      </div>
    </main>
  );
}

export default function CheckoutRoute() {
  return (
    <Suspense fallback={<LoadingState />}>
      <CheckoutPage />
    </Suspense>
  );
}
