
import { esc } from './format.js';

export const normalizePhone = (value = '') =>
  String(value).replace(/[\s-]/g, '').replace(/^\+?977/, '');

export function validateOrder(fields, paymentIds) {
  const errors = {};

  if ((fields.name ?? '').trim().length < 2) {
    errors.name = 'Enter your full name.';
  }

  if (!/^9[78]\d{8}$/.test(normalizePhone(fields.phone))) {
    errors.phone = 'Enter a 10-digit mobile number starting with 97 or 98.';
  }

  if (!(fields.city ?? '').trim()) {
    errors.city = 'Enter your city or town.';
  }

  if ((fields.address ?? '').trim().length < 6) {
    errors.address = 'Enter a delivery address with a nearby landmark.';
  }

  if (!paymentIds.includes(fields.payment)) {
    errors.payment = 'Choose how you will pay.';
  }

  return errors;
}

/**
 * Build the order payload.
 * Product prices and names are verified by the backend using Supabase.
 */
export const buildOrder = ({
  clientRef,
  fields,
  items,
  screenshotBase64
}) => ({
  clientRef,
  name: fields.name.trim(),
  phone: normalizePhone(fields.phone),
  city: fields.city.trim(),
  address: fields.address.trim(),
  paymentMethod: fields.payment,
  note: (fields.note ?? '').trim().slice(0, 300),

  items: items.map(({ id, size, qty }) => ({
    id: String(id),
    size: size ? String(size) : '',
    qty: Number(qty)
  })),

  screenshotBase64: screenshotBase64 || null
});

const field = (name, label, type, autocomplete) => `
  <div class="field">
    <label for="f-${name}">${label}</label>
    <input
      id="f-${name}"
      name="${name}"
      type="${type}"
      autocomplete="${autocomplete}"
      aria-describedby="e-${name}"
    >
    <p class="error" id="e-${name}"></p>
  </div>
`;

// Shared settings for the JPEG output sent to the backend.
const MAX_DIMENSION = 1200;
const JPEG_QUALITY = 0.75;

// Must match the pdf.js version loaded via <script> in index.html.
const PDFJS_WORKER_SRC =
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

/**
 * Create a canvas filled with white.
 * JPEG has no transparency, so transparent pixels would otherwise turn black.
 */
function createWhiteCanvas(width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));

  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Image processing is unavailable in this browser.');
  }

  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, canvas.width, canvas.height);

  return { canvas, context };
}

/**
 * Export a canvas as a compressed JPEG data URL.
 */
function canvasToJpegDataUrl(canvas) {
  const result = canvas.toDataURL('image/jpeg', JPEG_QUALITY);

  if (!result.startsWith('data:image/jpeg;base64,')) {
    throw new Error('Could not process the payment screenshot.');
  }

  return result;
}

/**
 * Compress a normal image file (JPEG, PNG, WebP) into a JPEG data URL.
 */
async function compressImageFile(file) {
  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Could not read the image.'));

    reader.readAsDataURL(file);
  });

  const image = await new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Invalid image file.'));

    img.src = dataUrl;
  });

  // Keep the longest dimension at or below MAX_DIMENSION pixels.
  const scale = Math.min(1, MAX_DIMENSION / Math.max(image.width, image.height));

  const { canvas, context } = createWhiteCanvas(
    image.width * scale,
    image.height * scale
  );

  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  return canvasToJpegDataUrl(canvas);
}

/**
 * Render the first page of a PDF onto a canvas with pdf.js
 * and export it as a JPEG data URL.
 */
async function convertPdfToJpeg(file) {
  const pdfjsLib = window.pdfjsLib;

  if (!pdfjsLib) {
    throw new Error('PDF support failed to load. Please upload an image instead.');
  }

  pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_SRC;

  let pdf;

  try {
    const data = new Uint8Array(await file.arrayBuffer());
    pdf = await pdfjsLib.getDocument({ data }).promise;

    const page = await pdf.getPage(1);

    // PDFs are vector, so pick the scale that makes the longest side
    // equal to MAX_DIMENSION.
    const baseViewport = page.getViewport({ scale: 1 });
    const scale = MAX_DIMENSION / Math.max(baseViewport.width, baseViewport.height);
    const viewport = page.getViewport({ scale });

    const { canvas, context } = createWhiteCanvas(viewport.width, viewport.height);

    await page.render({ canvasContext: context, viewport }).promise;

    return canvasToJpegDataUrl(canvas);
  } catch (error) {
    if (error?.name === 'PasswordException') {
      throw new Error(
        'This PDF is password protected. Please remove the password or upload a screenshot.'
      );
    }

    if (error?.name === 'InvalidPDFException') {
      throw new Error('Invalid PDF file.');
    }

    if (error instanceof Error && error.message.includes('payment screenshot')) {
      throw error;
    }

    console.error('PDF conversion failed:', error);
    throw new Error('Could not read this PDF. Please try another file.');
  } finally {
    pdf?.destroy();
  }
}

/**
 * Validate a payment proof (image or PDF) and convert it into a JPEG data URL.
 */
async function processScreenshot(file) {
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf'
  ];

  if (!allowedTypes.includes(file.type)) {
    throw new Error('Please upload a JPG, PNG, WebP image or a PDF.');
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error('File must be smaller than 5 MB.');
  }

  return file.type === 'application/pdf'
    ? convertPdfToJpeg(file)
    : compressImageFile(file);
}

export function mountCheckout(dialog, { cart, config, money, submit }) {
  const clientRef =
    `web-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

  const payments = Array.isArray(config.payments) ? config.payments : [];

  let busy = false;
  let screenshotBase64 = null;
  let processingScreenshot = false;

  const paymentOptions = payments.map((payment, index) => `
    <label class="radio">
      <input
        type="radio"
        name="payment"
        value="${esc(payment.id)}"
        ${index === 0 ? 'checked' : ''}
      >
      <span>
        ${esc(payment.label)}
        <small>${esc(payment.instructions ?? '')}</small>
      </span>
    </label>
  `).join('');

  dialog.innerHTML = `
    <div class="panel">
      <div class="panel__head">
        <h2>Checkout</h2>
        <button class="btn btn--ghost" type="button" data-close>
          Close
        </button>
      </div>

      <form novalidate>
        ${field('name', 'Full name', 'text', 'name')}
        ${field('phone', 'Mobile number', 'tel', 'tel')}
        ${field('city', 'City or town', 'text', 'address-level2')}
        ${field('address', 'Delivery address', 'text', 'street-address')}

        <fieldset class="field">
          <legend>Payment</legend>
          ${paymentOptions}
          <p class="error" id="e-payment"></p>
        </fieldset>

        <div
          id="bank-transfer-section"
          style="
            display:none;
            background:#f9f9f9;
            padding:15px;
            border-radius:8px;
            margin-bottom:15px;
            text-align:center;
            border:1px solid #ddd;
          "
        >
          <p style="margin-bottom:10px;font-weight:bold;">
            Scan QR to Pay
          </p>

          <!-- Replace with the store's genuine payment QR code. -->
          <img
            src="assets/images/qr.jpg"
            alt="Store payment QR code"
            style="
              display:block;
              margin:0 auto 10px;
              width:200px;
              max-width:100%;
              border:1px solid #ccc;
            "
          >

          <p style="font-size:12px;color:#666;margin-bottom:10px;">
            After paying, upload your payment screenshot below.
          </p>

          <input
            type="file"
            id="screenshot-upload"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            style="display:block;margin:0 auto;"
          >

          <p
            id="upload-status"
            role="status"
            aria-live="polite"
            style="font-size:12px;margin-top:5px;"
          ></p>
        </div>

        ${field('note', 'Note for the store (optional)', 'text', 'off')}

        <p class="total">
          <span>Subtotal (${Number(cart.count()) || 0} items)</span>
          <strong>${esc(money(cart.subtotal()))}</strong>
        </p>

        <p class="muted">${esc(config.delivery?.note ?? '')}</p>

        <p class="error" id="form-error" role="alert"></p>

        <button class="btn btn--block" type="submit">
          Place order
        </button>
      </form>
    </div>
  `;

  const form = dialog.querySelector('form');
  const button = form.querySelector('[type="submit"]');
  const formError = form.querySelector('#form-error');
  const bankSection = dialog.querySelector('#bank-transfer-section');
  const fileInput = dialog.querySelector('#screenshot-upload');
  const uploadStatus = dialog.querySelector('#upload-status');

  // Show or hide the bank transfer section.
  form.addEventListener('change', (event) => {
    if (event.target.name !== 'payment') return;

    const isBank = event.target.value === 'bank';

    bankSection.style.display = isBank ? 'block' : 'none';

    if (!isBank) {
      screenshotBase64 = null;
      processingScreenshot = false;
      fileInput.value = '';
      uploadStatus.textContent = '';
    }
  });

  // Process the selected payment screenshot.
  fileInput.addEventListener('change', async (event) => {
    const file = event.target.files?.[0];

    screenshotBase64 = null;
    uploadStatus.textContent = '';
    uploadStatus.style.color = '';

    if (!file) return;

    processingScreenshot = true;
    uploadStatus.textContent = 'Processing file...';
    fileInput.disabled = true;

    try {
      screenshotBase64 = await processScreenshot(file);
      uploadStatus.textContent = 'File attached!';
      uploadStatus.style.color = '#16a34a';
    } catch (error) {
      screenshotBase64 = null;
      uploadStatus.textContent =
        error.message || 'Could not process the file. Please try again.';

      fileInput.value = '';
    } finally {
      processingScreenshot = false;
      fileInput.disabled = false;
    }
  });

  // Submit the order.
  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (busy) return;

    formError.textContent = '';

    if (processingScreenshot) {
      formError.textContent =
        'Please wait for the payment screenshot to finish processing.';
      return;
    }

    const fields = Object.fromEntries(new FormData(form));
    const errors = validateOrder(fields, payments.map((payment) => payment.id));

    if (fields.payment === 'bank' && !screenshotBase64) {
      errors.payment = 'Please upload your payment screenshot.';
    }

    for (const name of ['name', 'phone', 'city', 'address', 'payment']) {
      const errorElement = form.querySelector(`#e-${name}`);
      if (errorElement) {
        errorElement.textContent = errors[name] ?? '';
      }
    }

    const firstError = Object.keys(errors)[0];

    if (firstError) {
      const target = form.querySelector(`[name="${firstError}"]`);
      target?.focus();
      return;
    }

    const cartItems = cart.items();

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      formError.textContent = 'Your bag is empty.';
      return;
    }

    // Basic client-side checks. The backend must validate these again.
    const validItems = cartItems.every((item) =>
      item &&
      item.id &&
      Number.isInteger(Number(item.qty)) &&
      Number(item.qty) > 0
    );

    if (!validItems) {
      formError.textContent =
        'Your cart contains an invalid product. Please refresh your bag.';
      return;
    }

    if (typeof submit !== 'function') {
      formError.textContent = 'Online ordering is currently unavailable.';
      return;
    }

    busy = true;
    button.disabled = true;
    button.textContent = 'Placing order...';

    try {
      const order = buildOrder({
        clientRef,
        fields,
        items: cartItems,
        screenshotBase64
      });

      const result = await submit(order);

      if (result?.ok === true && result.orderId) {
        cart.clear();

        dialog.innerHTML = `
          <div class="panel">
            <h2>Order received</h2>
            <p>
              Your order number is
              <strong>${esc(result.orderId)}</strong>.
              The store will contact you.
            </p>
            <button class="btn btn--block" type="button" data-close>
              Keep shopping
            </button>
          </div>
        `;

        return;
      }

      formError.textContent =
        result?.message ||
        'The store could not accept your order. Please try again.';

    } catch (error) {
      console.error('Checkout submission failed:', error);

      formError.textContent =
        'Something went wrong while placing your order. Please try again.';

    } finally {
      busy = false;

      // The success screen replaces the form, so do not access its button.
      if (form.isConnected && dialog.contains(button)) {
        button.disabled = false;
        button.textContent = 'Place order';
      }
    }
  });
}
  
