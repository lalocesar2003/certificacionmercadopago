import { MercadoPagoConfig, Preference } from "mercadopago";
import { NextResponse } from "next/server";

const PRODUCT = {
  id: "1001",
  title: "Ventilador 5 velocidades",
  description: "Ventilador práctico de 5 velocidades, ideal para refrescar tu casa, oficina o negocio.",
  unit_price: 100,
  currency_id: "PEN",
};

export async function POST(request) {
  try {
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    const integratorId = process.env.MERCADOPAGO_INTEGRATOR_ID;

    if (!accessToken) {
      return NextResponse.json(
        { error: "Falta MERCADOPAGO_ACCESS_TOKEN en .env.local" },
        { status: 503 }
      );
    }
    if (!integratorId) {
      return NextResponse.json(
        { error: "Falta MERCADOPAGO_INTEGRATOR_ID en .env.local" },
        { status: 503 }
      );
    }

    const payload = await request.json();
    const quantity = Number(payload.quantity);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
      return NextResponse.json({ error: "La cantidad debe estar entre 1 y 10" }, { status: 400 });
    }

    const client = new MercadoPagoConfig({
      accessToken,
      options: { integratorId },
    });
    const preferenceClient = new Preference(client);
    const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin).replace(/\/$/, "");
    const isPublicUrl = !/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(baseUrl);

    const preference = await preferenceClient.create({
      body: {
        items: [{ ...PRODUCT, picture_url: `${baseUrl}/producto-taza.svg`, quantity }],
        external_reference: `VENTILADOR-5V-${Date.now()}`,
        back_urls: {
          success: `${baseUrl}/resultado/aprobado`,
          pending: `${baseUrl}/resultado/pendiente`,
          failure: `${baseUrl}/resultado/rechazado`,
        },
        ...(isPublicUrl && {
          notification_url: `${baseUrl}/api/webhooks/mercadopago?source_news=webhooks`,
          auto_return: "approved",
        }),
        statement_descriptor: "VENTIFAN",
        metadata: { product_id: PRODUCT.id, quantity },
      },
    });

    return NextResponse.json({ preferenceId: preference.id });
  } catch (error) {
    console.error("Preference creation failed", error);
    return NextResponse.json(
      { error: error?.message || "Error interno al crear la preferencia" },
      { status: 500 }
    );
  }
}
