import { redirect } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { createClient } from "@/lib/supabase/server";
import { ResolveContactButton } from "./resolve-button";

export default async function AdminContactsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin/contacts");

  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) redirect("/");

  const { data: messages } = await supabase
    .from("contact_messages")
    .select("id, email, message, status, created_at")
    .order("created_at", { ascending: false });

  const unresolved = (messages ?? []).filter((m) => m.status === "unresolved");
  const resolved = (messages ?? []).filter((m) => m.status === "resolved");

  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-8">
        <div className="mb-5 flex items-center gap-4 text-[13px]">
          <Link href="/admin/reports" className="text-ink-sub hover:text-accent">
            通報
          </Link>
          <Link href="/admin/contacts" className="font-bold text-accent">
            お問い合わせ
          </Link>
        </div>

        <h1 className="mb-1.5 text-xl font-bold">お問い合わせ</h1>
        <p className="mb-6 text-[13px] text-ink-sub">未対応 {unresolved.length}件</p>

        {unresolved.length === 0 ? (
          <div className="rounded-xl border border-dashed border-line-strong bg-bg p-8 text-center text-[13px] text-ink-faint">
            未対応のお問い合わせはありません。
          </div>
        ) : (
          <div className="space-y-3">
            {unresolved.map((m) => (
              <div key={m.id} className="rounded-lg border border-line bg-panel p-4">
                <div className="mb-2 flex items-center justify-between text-[11px] text-ink-faint">
                  <span>{m.email || "（返信先未記入・匿名）"}</span>
                  <span>{new Date(m.created_at).toLocaleString("ja-JP")}</span>
                </div>
                <p className="mb-3 whitespace-pre-line text-[13px] leading-relaxed">{m.message}</p>
                <ResolveContactButton id={m.id} />
              </div>
            ))}
          </div>
        )}

        {resolved.length > 0 && (
          <details className="mt-8">
            <summary className="cursor-pointer text-[12.5px] text-ink-faint hover:text-ink-sub">
              対応済み（{resolved.length}件）
            </summary>
            <div className="mt-3 space-y-3">
              {resolved.map((m) => (
                <div key={m.id} className="rounded-lg border border-line bg-panel p-4 opacity-60">
                  <div className="mb-2 flex items-center justify-between text-[11px] text-ink-faint">
                    <span>{m.email || "（返信先未記入・匿名）"}</span>
                    <span>{new Date(m.created_at).toLocaleString("ja-JP")}</span>
                  </div>
                  <p className="whitespace-pre-line text-[13px] leading-relaxed">{m.message}</p>
                </div>
              ))}
            </div>
          </details>
        )}
      </main>
      <Footer />
    </>
  );
}
