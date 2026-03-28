"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SupplierPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/supplier/products");
  }, [router]);
  return null;
}
