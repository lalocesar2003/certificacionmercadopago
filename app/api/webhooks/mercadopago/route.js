import crypto from "node:crypto";
import { NextResponse } from "next/server";

function validSignature(request, dataId) {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  if (!secret) return true;

  const signature = request.headers.get("x-signature") || "";
  const requestId = request.headers.get("x-request-id") || "";
  const parts = Object.fromEntries(signature.split(",").map((part) => part.trim().split("=")));
  if (!parts.ts || !parts.v1) return false;

  const manifest = `id:${dataId};request-id:${requestId};ts:${parts.ts};`;
  const expected = crypto.createHmac("sha256", secret).update(manifest).digest("hex");
  const received = Buffer.from(parts.v1, "utf8");
  const expectedBuffer = Buffer.from(expected, "utf8");
  return received.length === expectedBuffer.length && crypto.timingSafeEqual(received, expectedBuffer);
}

export async function POST(request) {
  try {
    const payload = await request.json();
    const dataId = String(payload?.data?.id || request.nextUrl.searchParams.get("data.id") || "").toLowerCase();
    if (!dataId || !validSignature(request, dataId)) {
      return NextResponse.json({ error: "Firma o notificación inválida" }, { status: 401 });
    }

    if (payload.type === "payment" && process.env.MERCADOPAGO_ACCESS_TOKEN) {
      const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${dataId}`, {
        headers: { Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}` },
        cache: "no-store",
      });
      const payment = await paymentResponse.json();
      // En producción: persistir de forma idempotente usando payment.id.
      console.info("Webhook Mercado Pago", {
        id: payment.id,
        status: payment.status,
        externalReference: payment.external_reference,
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook processing failed", error);
    return NextResponse.json({ error: "No se pudo procesar la notificación" }, { status: 400 });
  }
}
