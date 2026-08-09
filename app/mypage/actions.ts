"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/mypage");
  return { supabase, user };
}

/** 表示名の変更 */
export async function updateDisplayName(
  _prevState: { error?: string; success?: boolean },
  formData: FormData
) {
  const { supabase, user } = await requireUser();
  const displayName = (formData.get("displayName") as string)?.trim();

  if (!displayName) {
    return { error: "表示名を入力してください。" };
  }
  if (displayName.length > 30) {
    return { error: "表示名は30文字以内で入力してください。" };
  }

  const { error } = await supabase
    .from("users")
    .update({ display_name: displayName })
    .eq("id", user.id);

  if (error) return { error: "変更に失敗しました。時間をおいて再度お試しください。" };

  revalidatePath("/mypage");
  revalidatePath(`/u/${user.id}`);
  return { success: true };
}

/** 自己紹介の変更(公開マイページに表示される) */
export async function updateBio(_prevState: { error?: string; success?: boolean }, formData: FormData) {
  const { supabase, user } = await requireUser();
  const bio = (formData.get("bio") as string)?.trim() ?? "";

  if (bio.length > 300) {
    return { error: "自己紹介は300文字以内で入力してください。" };
  }

  const { error } = await supabase
    .from("users")
    .update({ bio: bio || null })
    .eq("id", user.id);

  if (error) return { error: "変更に失敗しました。時間をおいて再度お試しください。" };

  revalidatePath("/mypage");
  revalidatePath(`/u/${user.id}`);
  return { success: true };
}

/** 好きな傾向タグの変更 */
export async function updateTasteTags(tags: string[]) {
  const { supabase, user } = await requireUser();
  await supabase.from("users").update({ taste_tags: tags }).eq("id", user.id);
  revalidatePath("/mypage");
  revalidatePath(`/u/${user.id}`);
}

/** アイコン・カラーの変更(アイコン選択ページから呼ぶ) */
export async function updateAvatar(icon: string, color: string) {
  const { supabase, user } = await requireUser();
  await supabase
    .from("users")
    .update({ avatar_icon: icon, avatar_color: color })
    .eq("id", user.id);
  revalidatePath("/mypage");
  revalidatePath(`/u/${user.id}`);
  redirect("/mypage");
}

/** 自分のレビューを削除 */
export async function deleteMyReview(reviewId: string) {
  const { supabase, user } = await requireUser();
  await supabase.from("reviews").delete().eq("id", reviewId).eq("user_id", user.id);
  revalidatePath("/mypage");
  revalidatePath(`/u/${user.id}`);
  revalidatePath(`/u/${user.id}/reviews`);
}

/** 自分が登録したシナリオを削除 */
/**
 * 自分が登録したシナリオを削除。
 * レビューが1件でも投稿されている場合は削除できない
 * (RLS側の削除ポリシーでも同じ条件を強制しているため、ここでのチェックは
 * 分かりやすいエラーメッセージを返すための冗長化。万一ここを通過しても
 * DB側で弾かれ、他人のレビューが巻き込まれて消えることはない)。
 */
export async function deleteMyScenario(scenarioId: string): Promise<{ error?: string }> {
  const { supabase, user } = await requireUser();

  const { count } = await supabase
    .from("reviews")
    .select("id", { count: "exact", head: true })
    .eq("scenario_id", scenarioId);

  if ((count ?? 0) > 0) {
    return { error: "レビューが投稿されているシナリオは削除できません。" };
  }

  const { error } = await supabase
    .from("scenarios")
    .delete()
    .eq("id", scenarioId)
    .eq("registered_by", user.id);

  if (error) {
    return { error: "削除に失敗しました。時間をおいて再度お試しください。" };
  }

  revalidatePath("/mypage");
  return {};
}

/** お気に入りの追加・解除を切り替える(シナリオ詳細ページから呼ぶ) */
export async function toggleFavorite(scenarioId: string) {
  const { supabase, user } = await requireUser();

  const { data: existing } = await supabase
    .from("favorites")
    .select("scenario_id")
    .eq("user_id", user.id)
    .eq("scenario_id", scenarioId)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("favorites")
      .delete()
      .eq("user_id", user.id)
      .eq("scenario_id", scenarioId);
  } else {
    await supabase.from("favorites").insert({ user_id: user.id, scenario_id: scenarioId });
  }

  revalidatePath(`/scenarios/${scenarioId}`);
  revalidatePath("/mypage");
  revalidatePath(`/u/${user.id}`);
}

/** お気に入りの一言メモを更新 */
export async function updateFavoriteNote(scenarioId: string, note: string) {
  const { supabase, user } = await requireUser();
  await supabase
    .from("favorites")
    .update({ note: note || null })
    .eq("user_id", user.id)
    .eq("scenario_id", scenarioId);
  revalidatePath("/mypage");
  revalidatePath(`/u/${user.id}`);
}

/** お気に入りから削除 */
export async function removeFavorite(scenarioId: string) {
  const { supabase, user } = await requireUser();
  await supabase
    .from("favorites")
    .delete()
    .eq("user_id", user.id)
    .eq("scenario_id", scenarioId);
  revalidatePath("/mypage");
  revalidatePath(`/u/${user.id}`);
}

/**
 * アカウント削除。
 * 投稿したレビュー・登録したシナリオ・お気に入りは常に削除する。
 *
 * SUPABASE_SERVICE_ROLE_KEY が設定されていれば、ログイン情報(auth.users)自体も
 * 完全に削除する。未設定の場合はプロフィールを匿名化してサインアウトするだけに留める
 * （再ログインするとログイン自体はできてしまうが、投稿データは残らない）。
 */
export async function deleteAccount() {
  const { supabase, user } = await requireUser();

  await supabase.from("favorites").delete().eq("user_id", user.id);
  await supabase.from("reviews").delete().eq("user_id", user.id);
  await supabase.from("scenarios").delete().eq("registered_by", user.id);

  const admin = createAdminClient();
  if (admin) {
    await admin.auth.admin.deleteUser(user.id);
  } else {
    await supabase
      .from("users")
      .update({
        display_name: "退会したユーザー",
        avatar_icon: "cat",
        avatar_color: "#6B675E",
        taste_tags: [],
        bio: null,
      })
      .eq("id", user.id);
  }

  await supabase.auth.signOut();
  redirect("/?accountDeleted=1");
}
