import { redirect } from "next/navigation";

export default function ManagePage() {
  redirect("/auth/login");
}
