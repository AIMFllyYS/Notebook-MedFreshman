"use client";

import { useEffect } from "react";
import { useStore } from "@/lib/stores/ui";

export default function LoginPage() {
  const openLoginOverlay = useStore((s) => s.openLoginOverlay);

  useEffect(() => {
    openLoginOverlay();
  }, [openLoginOverlay]);

  return null;
}
