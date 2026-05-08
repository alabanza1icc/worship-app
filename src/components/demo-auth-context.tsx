"use client";

import { createContext, useContext, ReactNode } from "react";

interface DemoUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  imageUrl: string;
  role: "admin" | "participant";
}

interface DemoAuthContextType {
  isDemo: boolean;
  user: DemoUser | null;
  userId: string | null;
}

const DemoAuthContext = createContext<DemoAuthContextType>({
  isDemo: true,
  user: null,
  userId: null,
});

export function useDemoAuth() {
  return useContext(DemoAuthContext);
}

export function DemoAuthProvider({ children }: { children: ReactNode }) {
  const demoUser: DemoUser = {
    id: "demo-user-001",
    firstName: "Demo",
    lastName: "Admin",
    email: "demo@worshipapp.com",
    imageUrl: "",
    role: "admin",
  };

  return (
    <DemoAuthContext.Provider
      value={{
        isDemo: true,
        user: demoUser,
        userId: demoUser.id,
      }}
    >
      {children}
    </DemoAuthContext.Provider>
  );
}