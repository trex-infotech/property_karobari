"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function VisitTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname.startsWith("/admin")) return;
    if (sessionStorage.getItem("pk_visited")) return;
    sessionStorage.setItem("pk_visited", "1");
    fetch("/api/visit", { method: "POST" }).catch(() => {});
  }, [pathname]);

  return null;
}
