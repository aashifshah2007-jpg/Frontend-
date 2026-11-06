/**
 * Public, browser-safe store settings. One file per client.
 */
export const config = Object.freeze({
  store: {
    name: 'BASEIC Clothing',
    tagline: 'Everyday minimal, comfortable fits.',
    intro: 'Free-size streetwear. Pick it, pay it, done.',
    phone: '+977 9814821128',   // <--- PUT CLIENT PHONE HERE
    email: 'aashifshah2007@gmail.com',  // <--- PUT CLIENT EMAIL HERE
  },
  currency: { code: 'NPR', symbol: 'NPR ', locale: 'en-NP' },
  announcement: 'Delivery across Nepal. Pay on delivery or by bank transfer.',
  delivery: { note: 'The store confirms the final total and delivery fee before dispatch.' },
  payments: [
    { id: 'cod', label: 'Cash on delivery', instructions: 'Pay the rider when your order arrives.' },
    { id: 'bank', label: 'Bank transfer', instructions: 'Scan the store QR, pay, then upload your screenshot or pdf.' },
  ],
  features: { search: true, sort: true },
  orders: { endpoint: 'https://basic-backend-nmoh.onrender.com', mock: false },
  // Public values used by /admin.html for login. The anon key is designed to be
  // public. NEVER put the service_role key here.
  admin: {
    supabaseUrl: 'https://eqomwbdchznyecdduhmh.supabase.co',
    supabaseAnonKey: 'sb_publishable_cHi-oQ0u7u1ARBF7SLo6zw_NLWUtnyB',
  },
});