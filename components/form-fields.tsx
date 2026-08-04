"use client";

export const inputClass =
  "w-full rounded-md border border-line-strong px-3.5 py-2.5 text-[13px] outline-none focus:border-accent";

export function Field({
  label,
  required,
  optional,
  desc,
  children,
}: {
  label: string;
  required?: boolean;
  optional?: boolean;
  desc?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-[18px]">
      <label className="mb-1.5 block text-[13px] font-medium">
        {label}
        {required && <span className="ml-1 text-[12px] text-accent">※必須</span>}
        {optional && <span className="ml-1 text-[11px] font-normal text-ink-faint">（任意）</span>}
      </label>
      {desc && <p className="mb-2 text-[11px] text-ink-faint">{desc}</p>}
      {children}
    </div>
  );
}

/** 複数選択できるチップ群(チェックボックス相当) */
export function TagSelect({
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
        <label key={opt} className="cursor-pointer">
          <input
            type="checkbox"
            name={name}
            value={opt}
            checked={selected.has(opt)}
            onChange={() => onToggle(opt)}
            className="hidden"
          />
          <span
            className={`inline-block rounded-full border px-3.5 py-1.5 text-xs transition-colors ${
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

/** 1つだけ選べるカード状の選択肢(ラジオボタン相当) */
export function ChoiceSelect({
  name,
  value,
  onChange,
  options,
}: {
  name: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string; sub?: string }[];
}) {
  return (
    <div className="grid gap-2.5" style={{ gridTemplateColumns: `repeat(auto-fit, minmax(150px, 1fr))` }}>
      {options.map((opt) => (
        <label key={opt.value} className="cursor-pointer">
          <input
            type="radio"
            name={name}
            value={opt.value}
            checked={value === opt.value}
            onChange={() => onChange(opt.value)}
            className="hidden"
          />
          <span
            className={`flex h-full flex-col items-center justify-center rounded-md border px-4 py-3 text-center text-[13px] transition-colors ${
              value === opt.value
                ? "border-accent bg-accent-bg text-accent"
                : "border-line-strong text-ink-sub"
            }`}
          >
            {opt.label}
            {opt.sub && <span className="mt-0.5 text-[11px] text-ink-faint">{opt.sub}</span>}
          </span>
        </label>
      ))}
    </div>
  );
}

/** 小さめの単一選択ラベル(戦闘の激しさ 等、特徴の3択に使う) */
export function LabelSelect({
  name,
  value,
  onChange,
  options,
}: {
  name: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="flex gap-2">
      {options.map((opt) => (
        <label key={opt.value} className="cursor-pointer">
          <input
            type="radio"
            name={name}
            value={opt.value}
            checked={value === opt.value}
            onChange={() => onChange(opt.value)}
            className="hidden"
          />
          <span
            className={`inline-block rounded-full border px-4 py-1.5 text-xs transition-colors ${
              value === opt.value
                ? "border-accent bg-accent-bg text-accent"
                : "border-line-strong text-ink-sub"
            }`}
          >
            {opt.label}
          </span>
        </label>
      ))}
    </div>
  );
}
