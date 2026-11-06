/**
 * BASEIC Clothing Catalog.
 * Premium streetwear descriptions and pricing.
 */

export const products = Object.freeze([
  // --- HOODIES & OUTERWEAR ---
  { 
    id: 'h1', 
    name: 'Money Comes Back Hoodie', 
    category: 'Outerwear', 
    price: 2499, 
    compareAt: 2999, // Shows crossed out price for a premium "sale" feel
    tone: '#e6e2da', 
    images: ['assets/images/h1a.jpg', 'assets/images/h1b.jpg'], 
    sizes: ['S', 'M', 'L', 'XL'], 
    description: '✨ Premium heavyweight fleece.<br><br>🧵 Bold back print: "MONEY COMES BACK. BUT CLOTHES GO OUT OF STOCK."<br><br>👕 Relaxed drop-shoulder fit. Double-stitched for durability.<br><br>🇳🇵 Perfect for chilly Kathmandu evenings.' 
  },
  { 
    id: 'h2', 
    name: 'Stoli Navy Hoodie', 
    category: 'Outerwear', 
    price: 2499, 
    compareAt: 2999, 
    tone: '#1a2530', 
    images: ['assets/images/h2a.jpg', 'assets/images/h2b.jpg'], 
    sizes: ['S', 'M', 'L', 'XL'], 
    description: '💎 Deep navy blue with a premium graphic back print.<br><br>🧶 Brushed-back fleece for maximum warmth.<br><br>🛠️ Kangaroo pocket and ribbed cuffs.<br><br>🧼 Wash cold inside out to protect the print.' 
  },
  { 
    id: 'h3', 
    name: 'Good Luck Burgundy Hoodie', 
    category: 'Outerwear', 
    price: 2499, 
    compareAt: 2999, 
    tone: '#4a1c24', 
    images: ['assets/images/h3a.jpg', 'assets/images/h3b.jpg', 'assets/images/h3c.jpg'], 
    sizes: ['S', 'M', 'L', 'XL'], 
    description: '🍀 Intricate blue "GOOD LUCK" graphic on a rich burgundy body.<br><br>🔥 Heavyweight cotton blend. Holds its shape wash after wash.<br><br>🎨 Detailed chest and back artwork.<br><br>🧥 A standout streetwear piece.' 
  },
  { 
    id: 'h4', 
    name: 'Botanical Art Hoodie', 
    category: 'Outerwear', 
    price: 2499, 
    compareAt: 2899, 
    tone: '#e6e2da', 
    images: ['assets/images/h4a.jpg', 'assets/images/h4b.jpg', 'assets/images/h4c.jpg'], 
    sizes: ['S', 'M', 'L', 'XL'], 
    description: '🌸 Elegant, artistic floral and line-art print.<br><br>🤍 Soft off-white fabric that pairs with everything.<br><br>☁️ Ultra-soft interior for cozy days.<br><br>💫 A subtle, premium statement piece.' 
  },
  { 
    id: 'c1', 
    name: 'Premium Collar Sweatshirt', 
    category: 'Outerwear', 
    price: 1899, 
    compareAt: 2299, 
    tone: '#dfe5e8', 
    images: ['assets/images/c1.jpg', 'assets/images/c2.jpg', 'assets/images/c3.jpg', 'assets/images/c4.jpg', 'assets/images/c5.jpg', 'assets/images/c6.jpg'], 
    sizes: ['S', 'M', 'L', 'XL'], 
    description: '👔 The smart-casual essential. Features a contrasting white collar.<br><br>🎨 Available in 6 premium colors (Navy, Light Grey, Black, Beige, Grey, Burgundy).<br><br>🧵 High-quality cotton blend with a soft brushed interior.<br><br>🏢 Perfect for the office or a night out.' 
  },

  // --- PANTS / BOTTOMS ---
  { 
    id: 's1', 
    name: 'Baggy Sweatpants', 
    category: 'Bottoms', 
    price: 1599, 
    compareAt: null, 
    tone: '#d9dfe4', 
    images: ['assets/images/s1.jpg'], 
    sizes: ['S', 'M', 'L', 'XL'], 
    description: '☁️ Terry cotton. Fits up to 85 kg and 5’10”.<br><br>📏 Length 39 in, thigh 13.5 in. A baggy fit, so the look depends on your build.<br><br>🧵 Elastic waist with adjustable drawstring.<br><br>🖤 Available in Black, Navy, and Light Grey.' 
  },

  // --- T-SHIRTS / TOPS ---
  { 
    id: 't1', 
    name: 'Move On Tee', 
    category: 'Tops', 
    price: 950, 
    compareAt: null, 
    tone: '#8c7b6b', 
    images: ['assets/images/t1.jpg'], 
    sizes: ['Free Size'], 
    description: '🤎 Premium brown oversized tee.<br><br>🖨️ Bold "MOVE ON" back print.<br><br>🧵 100% Combed cotton, 240 GSM.<br><br>📏 Free size: Fits up to 5’10” and 75 kg. Length 27 in, chest 22 in.' 
  },
  { 
    id: 't2', 
    name: 'Matcha Tee', 
    category: 'Tops', 
    price: 950, 
    compareAt: null, 
    tone: '#8c7b6b', 
    images: ['assets/images/t2.jpg'], 
    sizes: ['Free Size'], 
    description: '🍵 "think we should grab a matcha" handwritten back print.<br><br>🤎 Earthy brown colorway.<br><br>☁️ Ultra-soft breathable cotton.<br><br>📏 Free size: Fits up to 5’10” and 75 kg.' 
  },
  { 
    id: 't3', 
    name: 'Bad Choices Tee', 
    category: 'Tops', 
    price: 950, 
    compareAt: null, 
    tone: '#4a4a4a', 
    images: ['assets/images/t3.jpg'], 
    sizes: ['Free Size'], 
    description: '✍️ "BAD CHOICES MAKE GOOD STORIES" back print.<br><br>🩶 Washed charcoal/black finish.<br><br>🧶 Heavyweight cotton, relaxed drape.<br><br>📏 Free size: Fits up to 5’10” and 75 kg.' 
  },
  { 
    id: 't4', 
    name: 'Line Art Intuition Tee', 
    category: 'Tops', 
    price: 950, 
    compareAt: null, 
    tone: '#1a2530', 
    images: ['assets/images/t4.jpg'], 
    sizes: ['Free Size'], 
    description: '🪢 Minimalist line art back print: "LET YOUR INTUITION BE YOUR GUIDE".<br><br>💙 Deep navy color.<br><br>✨ Crisp, premium white screen print.<br><br>📏 Free size: Fits up to 5’10” and 75 kg.' 
  },
  { 
    id: 't5', 
    name: 'Blond Stripes Tee', 
    category: 'Tops', 
    price: 950, 
    compareAt: null, 
    tone: '#f5f3ef', 
    images: ['assets/images/t5.jpg'], 
    sizes: ['Free Size'], 
    description: '💙 "blond" graphic with blue text stripes.<br><br>🤍 Crisp white base.<br><br>🧵 Premium cotton, breathable and soft.<br><br>📏 Free size: Fits up to 5’10” and 75 kg.' 
  },
  { 
    id: 't6', 
    name: 'Ace Leopard Tee', 
    category: 'Tops', 
    price: 950, 
    compareAt: null, 
    tone: '#e6e2da', 
    images: ['assets/images/t6.jpg'], 
    sizes: ['Free Size'], 
    description: '🃏 Playing card "Ace" design with a leopard print center.<br><br>🐆 "Lucky you" cursive detail.<br><br>🤍 Off-white/beige base color.<br><br>📏 Free size: Fits up to 5’10” and 75 kg.' 
  },
  { 
    id: 't7', 
    name: 'Modernity Tee', 
    category: 'Tops', 
    price: 950, 
    compareAt: null, 
    tone: '#8c7b6b', 
    images: ['assets/images/t7.jpg'], 
    sizes: ['Free Size'], 
    description: '🏛️ "Modernity Has Failed The Human Entity" back print.<br><br>🤎 Premium brown base.<br><br>🔠 Edgy, editorial-style typography.<br><br>📏 Free size: Fits up to 5’10” and 75 kg.' 
  }
]);