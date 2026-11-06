
/**
 * The only module that communicates with the backend.
 *
 * checkout.js calls:
 * submitOrder(order, { config })
 *
 * Returns:
 * { ok: true, orderId }
 * { ok: true, orderId, test: true }
 * { ok: false, code, message }
 */

export async function submitOrder(
  order,
  { config, fetchImpl = globalThis.fetch, timeoutMs = 15000 } = {}
) {
  const endpoint = config?.orders?.endpoint?.replace(/\/+$/, "");
  const mock = config?.orders?.mock === true;

  // Development/demo mode only
  if (mock) {
    const reference = order?.clientRef || crypto.randomUUID();

    return {
      ok: true,
      test: true,
      orderId: `TEST-${String(reference).slice(-6)}`
    };
  }

  if (!endpoint) {
    return {
      ok: false,
      code: "NOT_CONFIGURED",
      message: "Online ordering is not switched on yet. Please contact the store."
    };
  }

  if (typeof fetchImpl !== "function") {
    return {
      ok: false,
      code: "FETCH_UNAVAILABLE",
      message: "Online ordering is unavailable in this browser."
    };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetchImpl(`${endpoint}/api/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(order),
      signal: controller.signal
    });

    let data;

    try {
      data = await response.json();
    } catch {
      return {
        ok: false,
        code: "INVALID_RESPONSE",
        message: "The store returned an invalid response. Please try again."
      };
    }

    if (response.ok && data?.ok === true && data.orderId) {
      return {
        ok: true,
        orderId: String(data.orderId)
      };
    }

    return {
      ok: false,
      code: data?.code || "REJECTED",
      message: data?.message || "The store could not accept this order. Please try again."
    };

  } catch (error) {
    return {
      ok: false,
      code: error?.name === "AbortError" ? "TIMEOUT" : "NETWORK",
      message: error?.name === "AbortError"
        ? "The request timed out. Please check your connection and try again."
        : "We could not reach the store. Check your connection and try again."
    };

  } finally {
    clearTimeout(timer);
  }
}
