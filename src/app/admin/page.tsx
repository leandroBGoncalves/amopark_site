import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { AdminDashboard } from "./AdminDashboard";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Painel administrativo",
  robots: "noindex, nofollow",
};

export default async function AdminPage() {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login?from=%2Fadmin");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") {
    redirect("/admin/login?error=forbidden");
  }

  return <AdminDashboard />;
}
