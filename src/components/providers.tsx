"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { ReactNode, useEffect } from "react";
import { DemoAuthProvider } from "./demo-auth-context";

const isDemoMode = !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
                   process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY === "pk_test_placeholder";

// Suppress known Clerk v6 BroadcastChannel race-condition noise.
// Clerk sometimes sends tab-sync messages before a listener is registered;
// the resulting unhandled rejection is harmless but pollutes the console.
function useClerkErrorSuppressor() {
  useEffect(() => {
    const handler = (event: PromiseRejectionEvent) => {
      const msg = event.reason?.message ?? "";
      if (msg.includes("No Listener") && msg.includes("tabs:")) {
        event.preventDefault();
      }
    };
    window.addEventListener("unhandledrejection", handler);
    return () => window.removeEventListener("unhandledrejection", handler);
  }, []);
}

function ClerkErrorSuppressor({ children }: { children: ReactNode }) {
  useClerkErrorSuppressor();
  return <>{children}</>;
}

export function Providers({ children }: { children: ReactNode }) {
  if (isDemoMode) {
    return <DemoAuthProvider>{children}</DemoAuthProvider>;
  }

  return (
    <ClerkProvider>
      <ClerkErrorSuppressor>{children}</ClerkErrorSuppressor>
    </ClerkProvider>
  );
}

export const DEMO_MODE = isDemoMode;