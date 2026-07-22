"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "./api";

export function useAdminGuard() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("as242_token");
    if (!token) {
      router.replace("/admin/login");
      return;
    }
    api
      .get("/api/auth/me")
      .then(() => setReady(true))
      .catch(() => {
        localStorage.removeItem("as242_token");
        router.replace("/admin/login");
      });
  }, [router]);

  return ready;
}
