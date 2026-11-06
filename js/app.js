/** Entry point: wires modules together. Business logic lives in the modules it imports. */
import { config } from './config.js';
import { products } from './products.js';
import { createCart } from './cart.js';
import { makeMoney, esc } from './format.js';
import { mountHeader } from './components/header.js';
import { mountFooter } from './components/footer.js';
import { productCard, productDetail } from './components/product-card.js';
import { mountCheckout } from './checkout.js';
import { submitOrder } from './order-service.js';

const $ = (sel) => document.querySelector(sel);
const money = makeMoney(config.currency);
let storage = null;
try { storage = window.localStorage; } catch { /* blocked: the cart lives in memory */ }
const cart = createCart({ catalog: products, storage });
const state = { category: 'All', sort: 'featured', query: '' };
let toastTimer;
let lastFocus = null;

function toast(message) {
  const t = $('#toast');
  t.textContent = message; t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2400);
}

function visibleProducts() {
  const q = state.query.trim().toLowerCase();
  const list = products.filter((p) => (state.category === 'All' || p.category === state.category) && p.name.toLowerCase().includes(q));
  if (state.sort === 'low') return [...list].sort((a, b) => a.price - b.price);
  if (state.sort === 'high') return [...list].sort((a, b) => b.price - a.price);
  return list;
}

function renderGrid() {
  const list = visibleProducts();
  $('#grid').innerHTML = list.map((p) => productCard(p, money)).join('');
  $('#count').textContent = list.length ? `${list.length} item${list.length === 1 ? '' : 's'}` : 'Nothing matches. Clear the search or pick another category.';
}

function renderChips() {
  const cats = ['All', ...new Set(products.map((p) => p.category))];
  $('#chips').innerHTML = cats.map((c) => `<button class="chip" type="button" data-cat="${esc(c)}" aria-pressed="${c === state.category}">${esc(c)}</button>`).join('');
}

function renderCart() {
  const d = $('#cart-dialog');
  const items = cart.items();
  const lines = items.map((l) => `<li><div><strong>${esc(l.product.name)}</strong><br><span class="muted">Size ${esc(l.size)} · ${money(l.product.price)}</span></div><div class="qty"><button type="button" data-act="dec" data-id="${esc(l.id)}" data-size="${esc(l.size)}" aria-label="Decrease quantity of ${esc(l.product.name)}">−</button><span aria-label="Quantity">${l.qty}</span><button type="button" data-act="inc" data-id="${esc(l.id)}" data-size="${esc(l.size)}" aria-label="Increase quantity of ${esc(l.product.name)}">+</button></div><span>${money(l.lineTotal)}</span><button class="btn btn--ghost" type="button" data-act="rm" data-id="${esc(l.id)}" data-size="${esc(l.size)}">Remove</button></li>`).join('');
  d.innerHTML = `<div class="panel"><div class="panel__head"><h2>Your bag</h2><button class="btn btn--ghost" type="button" data-close>Close</button></div>${items.length ? `<ul class="lines">${lines}</ul><p class="total"><span>Subtotal</span><strong>${money(cart.subtotal())}</strong></p><p class="muted">${esc(config.delivery.note)}</p><button class="btn btn--block" type="button" data-checkout>Checkout</button>` : '<p>Your bag is empty. Pick something from the range.</p>'}</div>`;
  if (lastFocus) (d.querySelector(lastFocus) ?? d.querySelector('[data-close]'))?.focus();
}

// Page chrome from config
document.title = config.store.name;
$('#announce').textContent = config.announcement;
$('#hero-title').textContent = config.store.tagline;
$('#hero-sub').textContent = config.store.intro;
{
  const wa = $('#contact-whatsapp'); const em = $('#contact-email');
  const digits = String(config.store.phone || '').replace(/\D/g, '');
  if (digits) { wa.href = `https://wa.me/${digits}`; wa.hidden = false; }
  if (config.store.email) { em.href = `mailto:${config.store.email}`; em.hidden = false; }
}
if (!config.features.search) $('#q').hidden = true;
if (!config.features.sort) $('#sort').hidden = true;

const header = mountHeader($('#site-header'), { config, onCartClick: () => { lastFocus = null; renderCart(); $('#cart-dialog').showModal(); } });
mountFooter($('#site-footer'), { config });
renderChips();
renderGrid();
header.setCount(cart.count());
cart.subscribe(() => { header.setCount(cart.count()); if ($('#cart-dialog').open) renderCart(); });

$('#chips').addEventListener('click', (e) => {
  const b = e.target.closest('[data-cat]');
  if (!b) return;
  state.category = b.dataset.cat;
  for (const c of $('#chips').children) c.setAttribute('aria-pressed', String(c === b));
  renderGrid();
});
$('#q').addEventListener('input', (e) => { state.query = e.target.value; renderGrid(); });
$('#sort').addEventListener('change', (e) => { state.sort = e.target.value; renderGrid(); });

$('#grid').addEventListener('click', (e) => {
  const b = e.target.closest('[data-open]');
  const p = b && products.find((x) => x.id === b.dataset.open);
  if (!p) return;
  const d = $('#product-dialog');
  d.innerHTML = productDetail(p, money);
  d.querySelector('form').addEventListener('submit', (ev) => {
    ev.preventDefault();
    const size = new FormData(ev.target).get('size');
    if (!size) { d.querySelector('.error').textContent = 'Choose a size first.'; return; }
    cart.add(p.id, size, 1);
    d.close();
    toast(`${p.name} (${size}) added to your bag`);
  });
  d.showModal();
});

$('#cart-dialog').addEventListener('click', (e) => {
  const b = e.target.closest('[data-act]');
  if (b) {
    const { act, id, size } = b.dataset;
    const line = cart.items().find((l) => l.id === id && l.size === size);
    lastFocus = act === 'rm' ? null : `[data-act="${act}"][data-id="${id}"][data-size="${size}"]`;
    if (act === 'rm') cart.remove(id, size); else if (line) cart.setQty(id, size, line.qty + (act === 'inc' ? 1 : -1));
    return;
  }
  if (e.target.closest('[data-checkout]')) {
    $('#cart-dialog').close();
    const d = $('#checkout-dialog');
    mountCheckout(d, { cart, config, money, submit: (order) => submitOrder(order, { config }) });
    d.showModal();
  }
});

// Close buttons and backdrop clicks (dialogs have no padding, so a click on the dialog itself is the backdrop)
document.addEventListener('click', (e) => {
  if (e.target instanceof HTMLDialogElement) e.target.close();
  else e.target.closest?.('[data-close]')?.closest('dialog')?.close();
});
