import test from 'node:test';
import assert from 'node:assert/strict';
import { validateOrder, buildOrder, normalizePhone } from '../js/checkout.js';
import { submitOrder } from '../js/order-service.js';

const good = { name: 'Sita Rai', phone: '+977 98-12345678', city: 'Kathmandu', address: 'Baneshwor, near temple', payment: 'cod' };

test('normalizePhone strips +977, spaces and dashes', () => {
  assert.equal(normalizePhone('+977 98-12345678'), '9812345678');
});

test('valid fields produce no errors; bad ones are flagged', () => {
  assert.deepEqual(validateOrder(good, ['cod', 'bank']), {});
  const e = validateOrder({ ...good, name: 'A', phone: '123', city: '', address: 'x', payment: 'x' }, ['cod', 'bank']);
  assert.deepEqual(Object.keys(e).sort(), ['address', 'city', 'name', 'payment', 'phone']);
});

test('buildOrder sends ids/sizes/qty only (never prices) in the shape the backend validates', () => {
  const o = buildOrder({ clientRef: 'r', fields: good, items: [{ id: 'h1', size: 'M', qty: 2, product: { price: 1 }, lineTotal: 2 }], screenshotBase64: null });
  assert.deepEqual(o.items, [{ id: 'h1', size: 'M', qty: 2 }]);
  assert.equal(o.phone, '9812345678');
  assert.equal(o.paymentMethod, 'cod');
  assert.ok(!JSON.stringify(o).includes('price'));
  assert.match(o.phone, /^9[78]\d{8}$/);
});

test('submitOrder posts JSON to <endpoint>/api/orders and maps the response', async () => {
  let seen;
  const fetchImpl = async (url, init) => { seen = { url, init }; return { ok: true, json: async () => ({ ok: true, orderId: 'BC-261103-7877' }) }; };
  const r = await submitOrder({ a: 1 }, { config: { orders: { endpoint: 'https://x.test/' } }, fetchImpl });
  assert.equal(seen.url, 'https://x.test/api/orders');
  assert.equal(seen.init.headers['Content-Type'], 'application/json');
  assert.deepEqual(r, { ok: true, orderId: 'BC-261103-7877' });
});

test('submitOrder surfaces backend rejection and network failure', async () => {
  const rej = await submitOrder({}, { config: { orders: { endpoint: 'https://x.test' } }, fetchImpl: async () => ({ ok: false, json: async () => ({ ok: false, message: 'Invalid phone number.' }) }) });
  assert.equal(rej.ok, false); assert.equal(rej.message, 'Invalid phone number.');
  const net = await submitOrder({}, { config: { orders: { endpoint: 'https://x.test' } }, fetchImpl: async () => { throw new Error('down'); } });
  assert.equal(net.code, 'NETWORK');
});
