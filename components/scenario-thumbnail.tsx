"use client";

import { useState } from "react";

/**
 * シナリオのサムネイル画像。
 * 頒布ページ(BOOTH等)の画像をそのまま参照表示しているだけなので、
 * リンク切れ・ホットリンク制限などで読み込みに失敗することがある。
 * その場合は静かにグラデーションのプレースホルダーへフォールバックする。
 */
export function ScenarioThumbnail({
  src,
  className,
  children,
}: {
  src: string | null | undefined;
  className?: string;
  children?: React.ReactNode;
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className={`relative bg-gradient-to-br from-[#3A2E33] to-[#241C22] ${className ?? ""}`}>
        {children}
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-gradient-to-br from-[#3A2E33] to-[#241C22] ${className ?? ""}`}>
      {/* eslint-disable-next-line @next/next/no-img-element -- 外部ドメイン画像のためnext/imageのremotePatterns設定を避けている */}
      <img
        src={src}
        alt=""
        onError={() => setFailed(true)}
        className="absolute inset-0 h-full w-full object-cover"
      />
      {children}
    </div>
  );
}
