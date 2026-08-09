import { Suspense } from "react";
import ThankYouPage from "@/components/thank-you-page";

function LoadingState() {
  return (
    <main className="min-h-screen px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl rounded-[40px] border border-white/80 bg-white/90 p-10 shadow-[0_35px_90px_rgba(120,53,15,0.12)]">
        Loading thank you page...
      </div>
    </main>
  );
}

export default function ThankYouRoute() {
  return (
    <Suspense fallback={<LoadingState />}>
      <ThankYouPage />
    </Suspense>
  );
}
