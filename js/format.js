/** Small helpers shared by components. */
const MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
/** Escape text before putting it inside an HTML template string. */
export const esc = (value) => String(value).replace(/[&<>"']/g, (c) => MAP[c]);
/** Returns money(n) -> "NPR 1,200" using the store currency settings. */
export function makeMoney({ symbol, locale }) {
  const fmt = new Intl.NumberFormat(locale);
  return (n) => `${symbol}${fmt.format(n)}`;
}
