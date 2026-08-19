"use client";

import { useActionState, useState } from "react";
import { createScenario, type CreateScenarioState } from "@/app/scenarios/new/actions";
import { updateScenario } from "@/app/scenarios/[id]/edit/actions";
import { TAG_GROUPS, SENSITIVE_TAGS, SUPPLEMENTS, PLAYER_OPTIONS } from "@/lib/content-taxonomy";
import { PLAY_TIME_RANGES } from "@/lib/play-time";
import { CollapsibleTagGroup } from "@/components/collapsible-tag-group";

type OgpResult = { title: string; thumbnailUrl: string; description: string };
type FetchStatus = "idle" | "loading" | "success" | "error";

export type ScenarioFormInitialValues = {
  title: string;
  authorName: string;
  circleName: string;
  distributionUrl: string;
  isFree: boolean;
  priceYen: number | null;
  systemVersion: string;
  setting: string;
  recommendedPlayers: string;
  playTimeText: string;
  playTimeRangeKey: string;
  hasCombat: boolean;
  wordCount: number | null;
  lossRate: string;
  requiredSkills: string;
  recommendedSkills: string;
  rollableSkills: string;
  discouraged: string;
  description: string;
  descriptionIsQuoted: boolean;
  thumbnailUrl: string;
  tags: string[];
  requiredSupplements: string[];
};

const initialState: CreateScenarioState = {};

export function ScenarioForm({
  mode = "create",
  scenarioId,
  initialValues,
}: {
  mode?: "create" | "edit";
  scenarioId?: string;
  initialValues?: ScenarioFormInitialValues;
}) {
  const action = mode === "edit" ? updateScenario.bind(null, scenarioId!) : createScenario;
  const [state, formAction, isPending] = useActionState(action, initialState);

  const [distributionUrl, setDistributionUrl] = useState(initialValues?.distributionUrl ?? "");
  const [fetchStatus, setFetchStatus] = useState<FetchStatus>("idle");
  const [fetchError, setFetchError] = useState("");
  const [ogp, setOgp] = useState<OgpResult | null>(
    initialValues?.thumbnailUrl ? { title: "", thumbnailUrl: initialValues.thumbnailUrl, description: "" } : null
  );

  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [description, setDescription] = useState(initialValues?.description ?? "");
  const [isFree, setIsFree] = useState(initialValues?.isFree ?? true);
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set(initialValues?.tags ?? []));
  const [selectedSupplements, setSelectedSupplements] = useState<Set<string>>(
    new Set(initialValues?.requiredSupplements ?? [])
  );

  async function handleFetchOgp() {
    if (!distributionUrl) return;
    setFetchStatus("loading");
    setFetchError("");

    try {
      const res = await fetch("/api/fetch-ogp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: distributionUrl }),
      });
      const data = await res.json();

      if (!res.ok) {
        setFetchStatus("error");
        setFetchError(data.error ?? "取得できませんでした。");
        return;
      }

      setOgp(data);
      setFetchStatus("success");
      if (data.title) setTitle(data.title);
      if (data.description) setDescription(data.description);
    } catch {
      setFetchStatus("error");
      setFetchError("通信エラーが発生しました。");
    }
  }

  function toggle(set: Set<string>, setSet: (s: Set<string>) => void, value: string) {
    const next = new Set(set);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    setSet(next);
  }

  const totalSelectedTags = selectedTags.size;

  return (
    <form action={formAction} className="space-y-5">
      {/* 頒布ページURL & 自動取得 */}
      <section className="rounded-xl border border-line bg-panel p-7">
        <h2 className="mb-1 text-[15px] font-bold">頒布ページURL</h2>
        <p className="mb-4 text-pretty text-xs text-ink-faint">
          {mode === "edit"
            ? "URLを修正した場合や、画像・タイトルを取得し直したい場合はこちらから再取得できます。"
            : "BOOTHなどの頒布ページURLを貼り付けてください。対応外のサイトの場合は手動で入力できます。"}
        </p>

        <div className="flex gap-2.5">
          <input
            type="url"
            value={distributionUrl}
            onChange={(e) => setDistributionUrl(e.target.value)}
            placeholder="https://example.booth.pm/items/1234567"
            className="flex-1 rounded-md border border-line-strong px-3.5 py-2.5 text-sm outline-none focus:border-accent"
          />
          <button
            type="button"
            onClick={handleFetchOgp}
            disabled={!distributionUrl || fetchStatus === "loading"}
            className="whitespace-nowrap rounded-md bg-accent px-5 text-[13px] text-white disabled:opacity-50"
          >
            {fetchStatus === "loading" ? "取得中…" : "情報を取得"}
          </button>
        </div>
        <p className="mt-2 flex items-center gap-1.5 text-[11px] text-ink-faint">
          画像は頒布ページから直接参照します（コピー・保存は行いません）
        </p>

        {fetchStatus === "success" && ogp && (
          <div className="mt-4 flex gap-4 rounded-lg border border-ok-bg bg-ok-bg p-4">
            {ogp.thumbnailUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={ogp.thumbnailUrl}
                alt=""
                className="h-24 w-24 flex-shrink-0 rounded-md object-cover"
              />
            )}
            <div className="min-w-0 flex-1">
              <p className="mb-1 flex items-center gap-1.5 text-[11px] font-medium text-ok">
                取得できました。内容を確認し、必要であれば下の項目を修正してください
              </p>
              <p className="truncate text-sm font-bold">{ogp.title}</p>
            </div>
          </div>
        )}

        {fetchStatus === "error" && (
          <div className="mt-4 rounded-lg border border-line-strong bg-bg p-4 text-[12px] text-ink-sub">
            {fetchError}　手動で下の項目に入力してください。
          </div>
        )}
      </section>

      {/* シナリオ情報 */}
      <section className="rounded-xl border border-line bg-panel p-7">
        <h2 className="mb-1 text-[15px] font-bold">シナリオ情報</h2>
        <p className="mb-4 text-xs text-ink-faint">
          タイトル・価格・頒布元以外は空欄のまま登録できます。詳細が分からない場合は無理に埋めなくて大丈夫です（登録後、内容はログイン済みの他の利用者も編集できます）。
        </p>

        <input type="hidden" name="thumbnailUrl" value={ogp?.thumbnailUrl ?? ""} />
        <input type="hidden" name="distributionUrl" value={distributionUrl} />

        <Field label="タイトル" required>
          <input
            name="title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClass}
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="作者名" optional>
            <input name="authorName" defaultValue={initialValues?.authorName} className={inputClass} />
          </Field>
          <Field label="サークル名" optional>
            <input
              name="circleName"
              defaultValue={initialValues?.circleName}
              placeholder="無ければ空欄で構いません"
              className={inputClass}
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="対応版" optional>
            <select name="systemVersion" defaultValue={initialValues?.systemVersion ?? ""} className={inputClass}>
              <option value="">不明・未設定</option>
              <option value="クトゥルフ神話TRPG">クトゥルフ神話TRPG</option>
              <option value="新クトゥルフ神話TRPG">新クトゥルフ神話TRPG</option>
            </select>
          </Field>
          <Field label="舞台" optional>
            <select name="setting" defaultValue={initialValues?.setting ?? ""} className={inputClass}>
              <option value="">不明・未設定</option>
              <option value="現代日本">現代日本</option>
              <option value="現代海外">現代海外</option>
              <option value="1920年代">1920年代</option>
              <option value="架空世界">架空世界</option>
              <option value="その他">その他</option>
            </select>
          </Field>
        </div>

        <Field label="推奨プレイ人数" optional>
          <select
            name="recommendedPlayers"
            defaultValue={initialValues?.recommendedPlayers ?? ""}
            className={inputClass}
          >
            <option value="">不明・未設定</option>
            {PLAYER_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="プレイ時間の目安" optional>
            <input
              name="playTimeText"
              defaultValue={initialValues?.playTimeText}
              placeholder="例：13〜24時間程度、半日程度"
              className={inputClass}
            />
          </Field>
          <Field label="検索用のプレイ時間帯" optional>
            <select
              name="playTimeRangeKey"
              defaultValue={initialValues?.playTimeRangeKey ?? ""}
              className={inputClass}
            >
              <option value="">不明・未設定</option>
              {PLAY_TIME_RANGES.map((r) => (
                <option key={r.key} value={r.key}>
                  {r.label}
                </option>
              ))}
            </select>
            <p className="mt-1.5 text-[11px] text-ink-faint">
              検索の絞り込みに使われます。上の自由記述と近いものを選んでください。
            </p>
          </Field>
        </div>

        <Field label="価格" required>
          <div className="mb-2 flex gap-4 text-[13px]">
            <label className="flex items-center gap-1.5">
              <input
                type="radio"
                name="isFree"
                value="true"
                checked={isFree}
                onChange={() => setIsFree(true)}
                className="h-4 w-4 accent-accent"
              />
              無料
            </label>
            <label className="flex items-center gap-1.5">
              <input
                type="radio"
                name="isFree"
                value="false"
                checked={!isFree}
                onChange={() => setIsFree(false)}
                className="h-4 w-4 accent-accent"
              />
              有料（投げ銭制も含む）
            </label>
          </div>
          {!isFree && (
            <input
              name="priceYen"
              type="number"
              min={0}
              required={!isFree}
              defaultValue={initialValues?.priceYen ?? undefined}
              placeholder="例：800"
              className={inputClass}
            />
          )}
        </Field>

        <Field label="戦闘要素" optional>
          <label className="flex items-center gap-2.5 text-[13px]">
            <input
              type="checkbox"
              name="hasCombat"
              defaultChecked={initialValues?.hasCombat}
              className="h-4 w-4 accent-accent"
            />
            戦闘が発生するシナリオである
          </label>
          <p className="ml-6 mt-1.5 text-[11px] text-ink-faint">
            チェックなしの場合、レビュー時の「戦闘の激しさ」の入力項目が表示されなくなります。
          </p>
        </Field>

        <Field label="シナリオ本文の文字数" optional>
          <input
            name="wordCount"
            type="number"
            defaultValue={initialValues?.wordCount ?? undefined}
            placeholder="例：15000（目安で構いません）"
            className={inputClass}
          />
        </Field>

        {/* 概要文中に書かれがちな「基本情報」を独立項目として登録できるようにする */}
        <div className="mt-1 rounded-lg border border-line-strong p-4">
          <div className="mb-3 text-[13px] font-medium">
            基本情報（技能等）<span className="ml-1 text-[11px] font-normal text-ink-faint">（任意）</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="ロスト率" optional>
              <input
                name="lossRate"
                defaultValue={initialValues?.lossRate}
                placeholder="例：中〜高"
                className={inputClass}
              />
            </Field>
            <Field label="非推奨（PC傾向・技能等）" optional>
              <input
                name="discouraged"
                defaultValue={initialValues?.discouraged}
                placeholder="例：低POW"
                className={inputClass}
              />
            </Field>
            <Field label="必須技能" optional>
              <input
                name="requiredSkills"
                defaultValue={initialValues?.requiredSkills}
                placeholder="例：各HOに準じた戦闘技能"
                className={inputClass}
              />
            </Field>
            <Field label="推奨技能" optional>
              <input
                name="recommendedSkills"
                defaultValue={initialValues?.recommendedSkills}
                placeholder="例：三大探索技能"
                className={inputClass}
              />
            </Field>
            <Field label="準推奨技能" optional>
              <input
                name="rollableSkills"
                defaultValue={initialValues?.rollableSkills}
                className={inputClass}
              />
            </Field>
          </div>
        </div>

        <div className="mt-6">
          <Field label="シナリオ概要" optional>
            <p className="mb-2 text-[11px] text-ink-faint">
              空欄のままでも登録できます。頒布ページのあらすじをそのまま貼り付ける場合は、下の「頒布ページより引用」にチェックしてください。
            </p>
            <textarea
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className={inputClass}
            />
            <label className="mt-2 flex items-center gap-2 text-[12px] text-ink-sub">
              <input
                type="checkbox"
                name="descriptionIsQuoted"
                defaultChecked={initialValues?.descriptionIsQuoted}
                className="h-3.5 w-3.5 accent-accent"
              />
              頒布ページより引用
            </label>
          </Field>
        </div>

        <Field label="必要サプリメント" optional>
          <p className="mb-2 text-[11px] text-ink-faint">
            プレイに必要な、またはあると望ましいサプリメント（ソースブック）を選んでください。複数選択できます。
          </p>
          <TagSelect
            options={SUPPLEMENTS}
            selected={selectedSupplements}
            onToggle={(v) => toggle(selectedSupplements, setSelectedSupplements, v)}
            name="requiredSupplements"
          />
        </Field>

        {/* タグはネタバレになり得る情報のため、登録時も一段折りたたんでおく */}
        <CollapsibleTagGroup title="詳細なタグを設定する" selectedCount={totalSelectedTags}>
          <p className="mb-3 text-[11px] text-ink-faint">
            当てはまるものを複数選択できます。検索・絞り込みに使われます。カテゴリ名をクリックすると開閉できます。
          </p>
          <div className="space-y-2.5">
            {TAG_GROUPS.map((group) => (
              <CollapsibleTagGroup
                key={group.title}
                title={group.title}
                selectedCount={group.tags.filter((t) => selectedTags.has(t)).length}
              >
                <TagSelect
                  options={group.tags}
                  selected={selectedTags}
                  onToggle={(v) => toggle(selectedTags, setSelectedTags, v)}
                  name="tags"
                />
              </CollapsibleTagGroup>
            ))}
          </div>

          {/* センシティブ要素は「遊んでも大丈夫か」の判断材料になる特別な情報のため、
              通常タグとは見た目を分けて別枠で選択させる */}
          <div className="mt-2.5">
            <CollapsibleTagGroup
              title="センシティブ要素"
              selectedCount={SENSITIVE_TAGS.filter((t) => selectedTags.has(t)).length}
              tone="sensitive"
            >
              <p className="mb-3 text-[11px] text-[#8A5A1E]">
                プレイヤーが事前に知っておいたほうがよい要素があれば選んでください。詳細ページでは通常タグと別枠で表示されます。
              </p>
              <TagSelect
                options={SENSITIVE_TAGS}
                selected={selectedTags}
                onToggle={(v) => toggle(selectedTags, setSelectedTags, v)}
                name="tags"
              />
            </CollapsibleTagGroup>
          </div>
        </CollapsibleTagGroup>
      </section>

      {state.error && (
        <p className="rounded-lg border border-accent-bg bg-accent-bg px-4 py-3 text-[13px] text-accent">
          {state.error}
        </p>
      )}

      <div className="flex items-center justify-between">
        <span className="text-pretty text-xs text-ink-faint">
          {mode === "edit"
            ? "この内容で更新します。"
            : "タイトル・価格・頒布元だけでも登録できます。残りの情報は後からマイページで追記できます。"}
        </span>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-accent px-7 py-2.5 text-[13px] text-white disabled:opacity-60"
        >
          {isPending ? "保存中…" : mode === "edit" ? "変更を保存する" : "シナリオを登録する"}
        </button>
      </div>
    </form>
  );
}

const inputClass =
  "w-full rounded-md border border-line-strong px-3.5 py-2.5 text-[13px] outline-none focus:border-accent";

function Field({
  label,
  required,
  optional,
  children,
}: {
  label: string;
  required?: boolean;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-[18px]">
      <label className="mb-2 block text-[13px] font-medium">
        {label}
        {required && <span className="ml-1 text-[12px] text-accent">※必須</span>}
        {optional && <span className="ml-1 text-[11px] font-normal text-ink-faint">（任意）</span>}
      </label>
      {children}
    </div>
  );
}

function TagSelect({
  options,
  selected,
  onToggle,
  name,
}: {
  options: string[];
  selected: Set<string>;
  onToggle: (value: string) => void;
  name: string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <label key={opt}>
          <input
            type="checkbox"
            name={name}
            value={opt}
            checked={selected.has(opt)}
            onChange={() => onToggle(opt)}
            className="peer hidden"
          />
          <span
            className={`inline-block cursor-pointer rounded-full border px-3.5 py-1.5 text-xs transition-colors ${
              selected.has(opt)
                ? "border-accent bg-accent-bg text-accent"
                : "border-line-strong text-ink-sub"
            }`}
          >
            {opt}
          </span>
        </label>
      ))}
    </div>
  );
}
