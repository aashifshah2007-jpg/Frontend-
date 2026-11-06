/** Header: brand, navigation, and cart indicator. */
import { esc } from '../format.js';

export function mountHeader(root, { config, onCartClick }) {
  root.innerHTML = `
    <a class="brand" href="./">${esc(config.store.name)}</a>
    <nav class="site-nav">
      <a href="#catalog">Shop</a>
      <a href="#about">About</a>
      <a href="#contact">Contact</a>
    </nav>
    <button class="cart-btn" type="button">Bag <span class="count">0</span></button>
  `;
  
  const button = root.querySelector('.cart-btn');
  const badge = root.querySelector('.count');
  button.addEventListener('click', onCartClick);
  
  return { 
    setCount(n) { 
      badge.textContent = n; 
      button.setAttribute('aria-label', `Open bag, ${n} item${n === 1 ? '' : 's'}`); 
    } 
  };
}
