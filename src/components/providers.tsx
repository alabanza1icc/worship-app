"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { ReactNode } from "react";
import { DemoAuthProvider } from "./demo-auth-context";

const isDemoMode = !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
                   process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY === "pk_test_placeholder";

export function Providers({ children }: { children: ReactNode }) {
  if (isDemoMode) {
    return <DemoAuthProvider>{children}</DemoAuthProvider>;
  }

  return (
    <ClerkProvider>
      {children}
    </ClerkProvider>
  );
}

export const DEMO_MODE = isDemoMode;