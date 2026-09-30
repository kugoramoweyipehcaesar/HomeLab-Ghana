"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getLocal } from "@/lib/utils";

export default function ProtectedRoute({ children, adminOnly = false }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const user = getLocal("currentUser");
    const isAdmin = typeof window !== "undefined" && localStorage.getItem("isAdmin") === "true";

    if (!user) {
      router.replace("/login");
      return;
    }
    if (adminOnly && !isAdmin) {
      router.replace("/dashboard");
      return;
    }
    setReady(true);
  }, [router, adminOnly]);

  if (!ready) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return children;
}