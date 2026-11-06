/** Product markup. Pure functions: product + money() in, HTML string out. All text is escaped. */
import { esc } from '../format.js';

const priceHTML = (p, money) => (p.compareAt ? `<span class="now">${money(p.price)}</span><s>${money(p.compareAt)}</s>` : money(p.price));

/** Grid card. The button carries data-open="<product id>"; app.js handles the click. */
export function productCard(p, money) {
  return `<li><button class="card__open" type="button" data-open="${esc(p.id)}"><span class="card__media" style="--tone:${esc(p.tone)}"><img src="${esc(p.images[0])}" alt="${esc(p.name)}" width="600" height="750" loading="lazy"></span><span class="card__name">${esc(p.name)}</span><span class="card__price">${priceHTML(p, money)}</span></button></li>`;
}

/** Product dialog content with a size picker. */
export function productDetail(p, money) {
  return `<div class="panel"><div class="panel__head"><h2>${esc(p.name)}</h2><button class="btn btn--ghost" type="button" data-close>Close</button></div>
<div class="detail__media" style="--tone:${esc(p.tone)}"><img src="${esc(p.images[0])}" alt="${esc(p.name)}" width="600" height="750"></div>
<p class="detail__price">${priceHTML(p, money)}</p><p>${p.description}</p>
<form novalidate><fieldset class="field"><legend>Size</legend><div class="sizes">${p.sizes.map((s) => `<label class="size"><input type="radio" name="size" value="${esc(s)}"><span>${esc(s)}</span></label>`).join('')}</div></fieldset>
<p class="error" role="alert"></p><button class="btn btn--block" type="submit">Add to bag</button></form></div>`;
}
