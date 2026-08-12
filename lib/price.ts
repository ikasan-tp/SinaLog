/** is_free/price_yenから表示用の価格文言を作る。未設定(null)は無料扱いにする。 */
export function priceLabel(isFree: boolean | null | undefined, priceYen: number | null | undefined) {
  if (isFree === false) return `${priceYen ?? "?"}円`;
  return "無料";
}
