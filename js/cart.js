/**
 * Cart state. Stores only {id, size, qty}; names and prices are always re-read
 * from the catalog. Totals are for display: the backend must recalculate.
 * createCart({ catalog, storage }) -> add, setQty, remove, clear, items, count, subtotal, subscribe
 */
const KEY = 'baseic.cart.v1';
export const MAX_QTY = 10;

export function createCart({ catalog, storage = null }) {
  const byId = new Map(catalog.map((p) => [p.id, p]));
  const listeners = new Set();

  function clean(line) {
    const p = byId.get(line?.id);
    const qty = Math.floor(Number(line?.qty));
    if (!p || !p.sizes.includes(line.size) || !(qty > 0)) return null;
    return { id: p.id, size: line.size, qty: Math.min(qty, MAX_QTY) };
  }
  function load() {
    try {
      const raw = JSON.parse(storage?.getItem(KEY) ?? '[]');
      return Array.isArray(raw) ? raw.map(clean).filter(Boolean) : [];
    } catch { return []; }
  }
  let lines = load();
  const find = (id, size) => lines.find((l) => l.id === id && l.size === size);
  function commit() {
    try { storage?.setItem(KEY, JSON.stringify(lines)); } catch { /* storage blocked: cart still works in memory */ }
    listeners.forEach((fn) => fn());
  }

  const api = {
    add(id, size, qty = 1) {
      const next = clean({ id, size, qty });
      if (!next) return false;
      const line = find(id, size);
      if (line) line.qty = Math.min(line.qty + next.qty, MAX_QTY); else lines.push(next);
      commit();
      return true;
    },
    setQty(id, size, qty) {
      const line = find(id, size);
      if (!line) return;
      if (!(qty >= 1)) return api.remove(id, size);
      line.qty = Math.min(Math.floor(qty), MAX_QTY);
      commit();
    },
    remove(id, size) { lines = lines.filter((l) => !(l.id === id && l.size === size)); commit(); },
    clear() { lines = []; commit(); },
    items() { 
  return lines
    .filter((l) => byId.has(l.id)) // <--- This checks if the product still exists
    .map((l) => {
      const p = byId.get(l.id);
      return { ...l, product: p, lineTotal: p.price * l.qty };
    }); 
},
    count() { return lines.reduce((n, l) => n + l.qty, 0); },
    subtotal() { return lines.reduce((sum, l) => sum + byId.get(l.id).price * l.qty, 0); },
    subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },
  };
  return api;
}