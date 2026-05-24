"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SubletsPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/admin/fleet?tab=sublets");
  }, [router]);
  return (
    <div className="flex h-[50vh] items-center justify-center">
      <p className="text-gray-400 animate-pulse">Redirecting to Fleet Management...</p>
    </div>
  );
}
