import test from 'node:test';
import assert from 'node:assert/strict';
import { createCart, MAX_QTY } from '../js/cart.js';
import { products } from '../js/products.js';

const mem = () => { const m = new Map(); return { getItem: k => m.get(k) ?? null, setItem: (k, v) => m.set(k, v) }; };

test('add, merge, subtotal', () => {
  const cart = createCart({ catalog: products, storage: mem() });
  assert.ok(cart.add('t1', 'Free Size', 2));
  assert.ok(cart.add('t1', 'Free Size', 1));
  assert.equal(cart.count(), 3);
  assert.equal(cart.subtotal(), 950 * 3);
});

test('rejects unknown product or size', () => {
  const cart = createCart({ catalog: products, storage: mem() });
  assert.equal(cart.add('nope', 'M', 1), false);
  assert.equal(cart.add('h1', 'XXL', 1), false);
});

test('quantity is capped at MAX_QTY and cart persists', () => {
  const storage = mem();
  const a = createCart({ catalog: products, storage });
  a.add('h1', 'M', 99);
  assert.equal(a.count(), MAX_QTY);
  assert.equal(createCart({ catalog: products, storage }).count(), MAX_QTY);
});

test('setQty below 1 removes the line', () => {
  const cart = createCart({ catalog: products, storage: mem() });
  cart.add('h1', 'M', 1); cart.setQty('h1', 'M', 0);
  assert.equal(cart.count(), 0);
});
