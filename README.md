# Ventifan Store — Mercado Pago Checkout Pro

Página mínima para vender un producto con Mercado Pago Checkout Pro: producto, carrito, creación de preferencia desde backend, redirección a Checkout Pro, páginas de resultado y webhook.

Producto actual:

- Ventilador 5 velocidades
- Precio: S/ 100
- Moneda: PEN

## Ejecutar

```bash
npm install
cp .env.example .env.local
# Completa las credenciales, el Integrator ID y NEXT_PUBLIC_BASE_URL
npm run dev
```

Abre `http://localhost:3000`. Para producción, configura estas variables también en Vercel:

- `MERCADOPAGO_ACCESS_TOKEN`: Access Token de producción.
- `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY`: Public Key de producción.
- `MERCADOPAGO_INTEGRATOR_ID`: tu Integrator ID personal.
- `NEXT_PUBLIC_BASE_URL`: URL pública de tu web, por ejemplo `https://tu-dominio.com`, sin slash final.
- `MERCADOPAGO_WEBHOOK_SECRET`: opcional, si activas firma de webhooks en Mercado Pago.

Nunca subas `.env.local` a GitHub ni pegues el access token en código cliente.

## Endpoints

- `POST /api/create-preference`: usa el SDK oficial de Node, configura `integratorId`, valida la cantidad, fija producto/precio en servidor y crea la preferencia.
- `POST /api/webhooks/mercadopago`: valida la firma si existe `MERCADOPAGO_WEBHOOK_SECRET`, consulta el pago y responde `200`.
- `/resultado/aprobado`, `/resultado/pendiente`, `/resultado/rechazado`.

El frontend inicializa `@mercadopago/sdk-react` con la Public Key y renderiza el componente `Wallet` usando el `preferenceId` recibido del backend. El backend usa el SDK oficial de Mercado Pago con `integratorId`, fija el producto/precio en servidor y genera un `external_reference` para identificar la compra.
