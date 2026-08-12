"use client";

import { useActionState, useState } from "react";
import { createReview, type CreateReviewState } from "./actions";
import { TagSelect, ChoiceSelect, LabelSelect, inputClass } from "@/components/form-fields";
import { CollapsibleTagGroup } from "@/components/collapsible-tag-group";
import { ELEMENT_GROUPS, MODIFICATION_DETAIL_OPTIONS, TAG_GROUPS } from "@/lib/content-taxonomy";

type Scenario = {
  id: string;
  title: string;
  author_name: string | null;
  has_combat: boolean;
  is_free: boolean;
};

type ExistingReview = {
  role: string;
  play_format: string;
  recommend: boolean;
  modification: string;
  modification_details: string[] | null;
  modification_advice: string | null;
  exploration_difficulty: string | null;
  combat_intensity: string | null;
  kp_or_pc_load: string | null;
  replay_intention: string | null;
  group_dependency: string | null;
  session_note: string | null;
  content_warning_adequacy: string | null;
  homage_answer: string | null;
  homage_note: string | null;
  ai_usage_answer: string | null;
  price_fairness: string | null;
  good_point: string;
  concern_point: string | null;
  spoiler_text: string | null;
  contains_spoiler: boolean;
  elements: string[] | null;
  tags: string[] | null;
};

const initialState: CreateReviewState = {};

export function ReviewForm({
  scenario,
  existingReview,
}: {
  scenario: Scenario;
  existingReview?: ExistingReview | null;
}) {
  const boundAction = createReview.bind(null, scenario.id);
  const [state, formAction, isPending] = useActionState(boundAction, initialState);

  const [role, setRole] = useState(existingReview?.role ?? "pl");
  const [playFormat, setPlayFormat] = useState(existingReview?.play_format ?? "text");
  const [recommend, setRecommend] = useState(existingReview?.recommend === false ? "no" : "yes");
  const [modification, setModification] = useState(existingReview?.modification ?? "none");
  const [modDetails, setModDetails] = useState<Set<string>>(
    new Set(existingReview?.modification_details ?? [])
  );
  const [homage, setHomage] = useState(existingReview?.homage_answer ?? "none");
  const [ai, setAi] = useState(existingReview?.ai_usage_answer ?? "no");
  const [groupDep, setGroupDep] = useState(existingReview?.group_dependency ?? "scenario");
  const [cwAdequacy, setCwAdequacy] = useState(existingReview?.content_warning_adequacy ?? "adequate");
  const [elements, setElements] = useState<Set<string>>(new Set(existingReview?.elements ?? []));
  const [tags, setTags] = useState<Set<string>>(new Set(existingReview?.tags ?? []));
  const [explorationDiff, setExplorationDiff] = useState(
    existingReview?.exploration_difficulty ?? "normal"
  );
  const [combatIntensity, setCombatIntensity] = useState(
    existingReview?.combat_intensity ?? "light"
  );
  const [load, setLoad] = useState(existingReview?.kp_or_pc_load ?? "normal");
  const [replay, setReplay] = useState(existingReview?.replay_intention ?? "yes");
  const [priceFairness, setPriceFairness] = useState(existingReview?.price_fairness ?? "fair");

  const isPaid = scenario.is_free === false;
  const isEdit = !!existingReview;

  const toggle = (set: Set<string>, setSet: (s: Set<string>) => void, value: string) => {
    const next = new Set(set);
    if (next.has(value)) {
      next.delete(value);
    } else {
      next.add(value);
    }
    setSet(next);
  };

  return (
    <form action={formAction} className="space-y-5">
      {/* 対象シナリオ */}
      <div className="flex items-center gap-3.5 rounded-xl border border-line bg-panel p-4">
        <div className="h-16 w-16 flex-shrink-0 rounded-lg bg-gradient-to-br from-[#3A2E33] to-[#241C22]" />
        <div>
          <div className="text-base font-bold">{scenario.title}</div>
          {scenario.author_name && (
            <div className="text-xs text-ink-sub">作者：{scenario.author_name}</div>
          )}
        </div>
      </div>

      {/* プレイした立場 */}
      <Section title="プレイした立場" desc="どちらの立場で遊んだかを選んでください。">
        <ChoiceSelect
          name="role"
          value={role}
          onChange={setRole}
          options={[
            { value: "pl", label: "プレイヤーとして遊んだ", sub: "探索者として参加した" },
            { value: "kp", label: "キーパーとして遊んだ", sub: "進行役としてセッションを回した" },
          ]}
        />
      </Section>

      {/* プレイ形式 */}
      <Section title="プレイ形式" desc="実際に遊んだ形式を選んでください。">
        <ChoiceSelect
          name="playFormat"
          value={playFormat}
          onChange={setPlayFormat}
          options={[
            { value: "text", label: "テキセ", sub: "テキストチャット中心" },
            { value: "voice", label: "ボイセ", sub: "音声通話中心" },
            { value: "inperson", label: "対面" },
          ]}
        />
      </Section>

      {/* 総合評価 */}
      <Section title="総合評価" desc="このシナリオを他の人に勧めたいと思いますか。">
        <div className="flex gap-3">
          <RecommendButton
            active={recommend === "yes"}
            onClick={() => setRecommend("yes")}
            variant="yes"
            label="おすすめ"
          />
          <RecommendButton
            active={recommend === "no"}
            onClick={() => setRecommend("no")}
            variant="no"
            label="おすすめしない"
          />
        </div>
        <input type="hidden" name="recommend" value={recommend} />
      </Section>

      {/* シナリオの改変 */}
      <Section title="シナリオの改変" desc="配布されている原文のまま遊んだか、KPが調整を加えたかを選んでください。">
        <ChoiceSelect
          name="modification"
          value={modification}
          onChange={setModification}
          options={[
            { value: "none", label: "原文通り遊んだ", sub: "改変なし" },
            { value: "partial", label: "一部を改変した", sub: "難易度・NPCなど軽微な調整" },
            { value: "major", label: "大幅に改変した", sub: "展開や設定を大きく変更" },
          ]}
        />
        {modification !== "none" && (
          <div className="mt-4 rounded-lg bg-bg p-4">
            <div className="mb-2 text-xs font-medium">具体的に何を変えましたか</div>
            <TagSelect
              options={MODIFICATION_DETAIL_OPTIONS}
              selected={modDetails}
              onToggle={(v) => toggle(modDetails, setModDetails, v)}
              name="modificationDetails"
            />
          </div>
        )}
      </Section>

      {/* 改変のアドバイス */}
      <Section title="改変のアドバイス" optional desc="改変した点や、改変をおすすめしたい点があれば書いてください。次にKPを務める人の参考になります。">
        <textarea
          name="modificationAdvice"
          defaultValue={existingReview?.modification_advice ?? ""}
          rows={3}
          className={inputClass}
        />
      </Section>

      {/* シナリオの特徴 */}
      <Section title="シナリオの特徴" desc="良し悪しではなく、どんなタイプのシナリオかを選んでください。">
        <div className="space-y-3.5">
          {scenario.has_combat && (
            <FeatureRow label="戦闘の激しさ">
              <LabelSelect
                name="combatIntensity"
                value={combatIntensity}
                onChange={setCombatIntensity}
                options={[
                  { value: "none", label: "ほぼ無い" },
                  { value: "light", label: "軽め" },
                  { value: "heavy", label: "激しめ" },
                ]}
              />
            </FeatureRow>
          )}
          <FeatureRow label="探索の難しさ">
            <LabelSelect
              name="explorationDifficulty"
              value={explorationDiff}
              onChange={setExplorationDiff}
              options={[
                { value: "easy", label: "優しい" },
                { value: "normal", label: "普通" },
                { value: "severe", label: "シビア" },
              ]}
            />
          </FeatureRow>
          <FeatureRow label={role === "kp" ? "KP進行の負担" : "PCの動かしやすさ"}>
            <LabelSelect
              name="kpOrPcLoad"
              value={load}
              onChange={setLoad}
              options={[
                { value: "light", label: "軽い" },
                { value: "normal", label: "普通" },
                { value: "heavy", label: "重い" },
              ]}
            />
          </FeatureRow>
        </div>
      </Section>

      {/* 追加の評価 */}
      <Section title="追加の評価" desc="これから遊ぶか迷っている人の判断材料になる質問です。">
        <div className="space-y-5">
          <div>
            <div className="mb-2 text-[13px] font-medium">
              またこのシナリオを回したい、または人に勧めたいと思いますか
            </div>
            <ChoiceSelect
              name="replayIntention"
              value={replay}
              onChange={setReplay}
              options={[
                { value: "yes", label: "また遊びたい" },
                { value: "neutral", label: "どちらとも言えない" },
                { value: "no", label: "積極的には遊ばない" },
              ]}
            />
          </div>

          <div>
            <div className="mb-2 text-[13px] font-medium">
              シナリオの注意書き（content warning）は妥当でしたか
            </div>
            <ChoiceSelect
              name="contentWarningAdequacy"
              value={cwAdequacy}
              onChange={setCwAdequacy}
              options={[
                { value: "insufficient", label: "注意書きが足りなかった", sub: "記載以上の描写があった" },
                { value: "adequate", label: "ちょうど良かった" },
                { value: "excessive", label: "注意書きが過剰だった", sub: "記載ほどの内容はなかった" },
              ]}
            />
            {cwAdequacy === "insufficient" && (
              <div className="mt-4 rounded-lg bg-bg p-4">
                <div className="mb-1 text-xs font-medium">何についての注意書きが足りませんでしたか</div>
                <p className="mb-3 text-[11px] text-ink-faint">
                  内容の核心（誰が・何が・どうなるか）には触れず、種類だけを選んでください。
                </p>
                <div className="space-y-2.5">
                  {ELEMENT_GROUPS.map((g) => (
                    <CollapsibleTagGroup
                      key={g.title}
                      title={g.title}
                      selectedCount={g.items.filter((t) => elements.has(t)).length}
                    >
                      <TagSelect
                        options={g.items}
                        selected={elements}
                        onToggle={(v) => toggle(elements, setElements, v)}
                        name="elements"
                      />
                    </CollapsibleTagGroup>
                  ))}
                </div>
              </div>
            )}
          </div>

          {isPaid && (
            <div>
              <div className="mb-2 text-[13px] font-medium">価格に見合う内容だと感じましたか</div>
              <ChoiceSelect
                name="priceFairness"
                value={priceFairness}
                onChange={setPriceFairness}
                options={[
                  { value: "over", label: "価格以上だった" },
                  { value: "fair", label: "価格相応だった" },
                  { value: "under", label: "価格ほどではなかった" },
                ]}
              />
            </div>
          )}
        </div>
      </Section>

      {/* 元ネタ */}
      <Section title="引用・参考元について" desc="他の作品からの影響を感じた場合、近いものを選んでください。">
        <ChoiceSelect
          name="homageAnswer"
          value={homage}
          onChange={setHomage}
          options={[
            { value: "none", label: "特に感じなかった" },
            { value: "credited", label: "元ネタが本文中に明記されていた" },
            { value: "concerning", label: "参照の仕方に少し引っかかりを感じた" },
          ]}
        />
        {homage === "concerning" && (
          <div className="mt-4 rounded-lg bg-bg p-4">
            <div className="mb-2 text-xs font-medium">思い当たる作品があれば教えてください</div>
            <input
                  name="homageNote"
                  defaultValue={existingReview?.homage_note ?? ""}
                  placeholder="例：〇〇というドラマ／小説 など"
                  className={inputClass}
                />
          </div>
        )}
      </Section>

      {/* 生成AI */}
      <Section title="生成AIの使用について" desc="本文やイラスト・図表に生成AIが使われていると感じたかを選んでください。">
        <ChoiceSelect
          name="aiUsageAnswer"
          value={ai}
          onChange={setAi}
          options={[
            { value: "no", label: "使われていないと思う" },
            { value: "yes", label: "使われていると思う" },
            { value: "unknown", label: "判断がつかない" },
          ]}
        />
      </Section>

      {/* 別の参加者 */}
      <Section title="別の参加者だったとしても楽しめたと思うか" desc="シナリオ自体の面白さと、その日のメンバーとの相性を分けて考えるための質問です。">
        <ChoiceSelect
          name="groupDependency"
          value={groupDep}
          onChange={setGroupDep}
          options={[
            { value: "scenario", label: "そう思う", sub: "メンバーが変わっても楽しめたはず" },
            { value: "neutral", label: "どちらとも言えない" },
            { value: "group", label: "今回のメンバーだからこそ楽しめた", sub: "シナリオ単体の評価とは分けたい" },
          ]}
        />
        <div className="mt-3.5">
          <label className="mb-1.5 block text-[11px] text-ink-faint">
            セッションならではの良さがあれば（任意）
          </label>
          <input
            name="sessionNote"
            defaultValue={existingReview?.session_note ?? ""}
            placeholder="例：KPのアドリブが上手く、雰囲気作りが良かった"
            className={inputClass}
          />
        </div>
      </Section>

      {/* 良かった点 */}
      <Section title="良かった点" required desc="ネタバレを含まない範囲で、良かった点や向いているプレイヤー像などを書いてください。">
        <textarea
          name="goodPoint"
          required
          defaultValue={existingReview?.good_point ?? ""}
          rows={5}
          className={inputClass}
        />
      </Section>

      {/* 気になった点 */}
      <Section title="気になった点" optional desc="空欄でも投稿できます。">
        <textarea
          name="concernPoint"
          defaultValue={existingReview?.concern_point ?? ""}
          rows={4}
          className={inputClass}
        />
      </Section>

      {/* ネタバレフラグ */}
      <Section
        title="ネタバレへの配慮"
        optional
        desc="「良かった点」「気になった点」の中に、シナリオの真相・展開に関する記述が含まれる場合はチェックしてください。チェックすると、レビュー一覧では内容が初期非表示になります。"
      >
        <label className="flex items-center gap-2.5 text-[13px]">
          <input
            type="checkbox"
            name="containsSpoiler"
            defaultChecked={existingReview?.contains_spoiler}
            className="h-4 w-4 accent-accent"
          />
          このレビューにはネタバレを含む
        </label>
      </Section>

      {/* ネタバレ */}
      <Section title="ネタバレ感想を追加する" optional desc="この欄に書いた内容は「ネタバレを見る」を押した人にだけ表示されます。">
        <textarea
          name="spoilerText"
          defaultValue={existingReview?.spoiler_text ?? ""}
          rows={4}
          className={inputClass}
        />
      </Section>

      {/* タグ */}
      <Section title="当てはまるタグ" optional desc="複数選択できます。カテゴリ名をクリックすると開閉できます。">
        <div className="space-y-2.5">
          {TAG_GROUPS.map((g) => (
            <CollapsibleTagGroup
              key={g.title}
              title={g.title}
              selectedCount={g.tags.filter((t) => tags.has(t)).length}
            >
              <TagSelect
                options={g.tags}
                selected={tags}
                onToggle={(v) => toggle(tags, setTags, v)}
                name="tags"
              />
            </CollapsibleTagGroup>
          ))}
        </div>
      </Section>

      {state.error && (
        <p className="rounded-lg border border-accent-bg bg-accent-bg px-4 py-3 text-[13px] text-accent">
          {state.error}
        </p>
      )}

      <div className="flex items-center justify-between pt-1">
        <span className="text-pretty text-xs text-ink-faint">
          {isEdit ? "この内容で上書き保存します。" : "投稿後も内容の編集はいつでもできます。"}
        </span>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-accent px-7 py-2.5 text-[13px] text-white disabled:opacity-60"
        >
          {isPending ? "保存中…" : isEdit ? "レビューを更新する" : "レビューを投稿する"}
        </button>
      </div>
    </form>
  );
}

function Section({
  title,
  desc,
  required,
  optional,
  children,
}: {
  title: string;
  desc?: string;
  required?: boolean;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-line bg-panel p-6">
      <h2 className="mb-1 text-[15px] font-bold">
        {title}
        {required && <span className="ml-1.5 text-[12px] font-normal text-accent">※必須</span>}
        {optional && <span className="ml-1.5 text-[11px] font-normal text-ink-faint">（任意）</span>}
      </h2>
      {desc && <p className="mb-4 text-xs text-ink-faint">{desc}</p>}
      {children}
    </section>
  );
}

function FeatureRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3.5 last:border-0 last:pb-0">
      <span className="text-[13px]">{label}</span>
      {children}
    </div>
  );
}

function RecommendButton({
  active,
  onClick,
  variant,
  label,
}: {
  active: boolean;
  onClick: () => void;
  variant: "yes" | "no";
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-1 flex-col items-center gap-2 rounded-lg border py-5 text-[13px] font-medium transition-colors ${
        active
          ? variant === "yes"
            ? "border-ok bg-ok text-white"
            : "border-accent bg-accent text-white"
          : "border-line-strong text-ink-faint"
      }`}
    >
      {variant === "yes" ? <ThumbUpIcon /> : <ThumbDownIcon />}
      {label}
    </button>
  );
}

function ThumbUpIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 10v12" />
      <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z" />
    </svg>
  );
}

function ThumbDownIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 14V2" />
      <path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22h0a3.13 3.13 0 0 1-3-3.88Z" />
    </svg>
  );
}
