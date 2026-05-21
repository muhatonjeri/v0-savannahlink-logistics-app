import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h2 className="text-xl font-semibold">Page Not Found</h2>
      <Button asChild>
        <Link href="/">Go Home</Link>
      </Button>
    </div>
  );
}
