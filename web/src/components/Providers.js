"use client";

import { StudioProvider } from "../lib/StudioContext";
import RegisterSW from "./RegisterSW";

export default function Providers({ children }) {
  return (
    <StudioProvider>
      {children}
      <RegisterSW />
    </StudioProvider>
  );
}
