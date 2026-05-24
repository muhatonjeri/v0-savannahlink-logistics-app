"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="h-16 w-16 rounded-full bg-red-500/20 flex items-center justify-center mb-6">
        <AlertTriangle className="h-8 w-8 text-red-400" />
      </div>
      <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
      <p className="text-gray-400 text-sm mb-2 max-w-md">
        {error.message || "An unexpected error occurred. The team has been notified."}
      </p>
      {error.digest && (
        <p className="text-gray-600 text-xs font-mono mb-6">Error ID: {error.digest}</p>
      )}
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#e67e22] hover:bg-[#d35400] text-white font-medium text-sm transition-colors">
          <RefreshCw className="h-4 w-4" />Try Again
        </button>
        <Link href="/admin"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/20 text-gray-300 hover:text-white hover:bg-white/10 font-medium text-sm transition-colors">
          <Home className="h-4 w-4" />Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
