"use client";

import { Suspense } from "react";
import ReserverForm from "./ReserverForm";

export default function ReserverPage() {
  return (
    <Suspense fallback={<div className="container section">Chargement...</div>}>
      <ReserverForm />
    </Suspense>
  );
}
