/** Footer: contact, delivery and payment info, all read from config. */
import { esc } from '../format.js';

export function mountFooter(root, { config }) {
  const { store, payments, delivery } = config;
  const contact = [store.phone && `<a href="tel:${esc(store.phone)}">${esc(store.phone)}</a>`, store.email && `<a href="mailto:${esc(store.email)}">${esc(store.email)}</a>`].filter(Boolean).join('<br>');
  root.innerHTML = `<div class="site-footer__in"><div><strong>${esc(store.name)}</strong><p class="muted">${esc(store.tagline)}</p></div><div><strong>Delivery</strong><p class="muted">${esc(delivery.note)}</p></div><div><strong>Pay by</strong><p class="muted">${payments.map((m) => esc(m.label)).join(', ')}</p></div>${contact ? `<div><strong>Contact</strong><p>${contact}</p></div>` : ''}</div>`;
}
