import { MercadoPagoConfig, Preference } from "mercadopago";
import { NextResponse } from "next/server";

const PRODUCT = {
  id: "4827",
  title: "Taza Nómada",
  description: "Dispositivo de tienda móvil de comercio electrónico",
  unit_price: 79.9,
  currency_id: "PEN",
};

export async function POST(request) {
  try {
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    const integratorId = process.env.MERCADOPAGO_INTEGRATOR_ID;
    const payerEmail = process.env.MERCADOPAGO_ACCOUNT_EMAIL;

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
    if (!payerEmail || !payerEmail.includes("@")) {
      return NextResponse.json(
        { error: "Configura MERCADOPAGO_ACCOUNT_EMAIL con el correo de tu cuenta" },
        { status: 503 }
      );
    }

    const payload = await request.json();
    const quantity = Number(payload.quantity);
    if (quantity !== 1) {
      return NextResponse.json({ error: "La certificación requiere cantidad 1" }, { status: 400 });
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
        items: [{ ...PRODUCT, picture_url: `${baseUrl}/producto-taza.svg`, quantity: 1 }],
        payment_methods: {
          excluded_payment_methods: [{ id: "visa" }],
          installments: 6,
        },
        external_reference: payerEmail,
        back_urls: {
          success: `${baseUrl}/resultado/aprobado`,
          pending: `${baseUrl}/resultado/pendiente`,
          failure: `${baseUrl}/resultado/rechazado`,
        },
        ...(isPublicUrl && {
          notification_url: `${baseUrl}/api/webhooks/mercadopago?source_news=webhooks`,
          auto_return: "approved",
        }),
        statement_descriptor: "NOMADA STORE",
        metadata: { product_id: PRODUCT.id, quantity: 1 },
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
