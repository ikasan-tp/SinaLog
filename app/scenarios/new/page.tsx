import { redirect } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { createClient } from "@/lib/supabase/server";
import { ScenarioForm } from "./scenario-form";

export default async function NewScenarioPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/scenarios/new");
  }

  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-8">
        <h1 className="mb-1.5 text-xl font-bold">シナリオを登録する</h1>
        <p className="mb-7 text-[13px] text-ink-sub">
          頒布ページのURLを入力すると、画像や商品名を自動で取得します。取得できない場合は手動で入力してください。
        </p>
        <ScenarioForm />
      </main>
      <Footer />
    </>
  );
}
