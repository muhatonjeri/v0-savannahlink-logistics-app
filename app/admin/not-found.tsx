import Link from "next/link";
import { Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="h-16 w-16 rounded-full bg-gray-500/20 flex items-center justify-center mb-6">
        <Search className="h-8 w-8 text-gray-400" />
      </div>
      <h2 className="text-xl font-bold text-white mb-2">Page Not Found</h2>
      <p className="text-gray-400 text-sm mb-6">This page doesn&apos;t exist or has been moved.</p>
      <Link href="/admin"
        className="px-5 py-2.5 rounded-xl bg-[#e67e22] hover:bg-[#d35400] text-white font-medium text-sm transition-colors">
        Back to Dashboard
      </Link>
    </div>
  );
}
