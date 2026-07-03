# Nómada Store — Mercado Pago Checkout Pro

Demo mínima para certificación: producto, carrito, creación de preferencia desde backend, redirección a Checkout Pro, páginas de resultado y webhook.

## Ejecutar

```bash
npm install
cp .env.example .env.local
# Completa las credenciales, el Integrator ID y NEXT_PUBLIC_BASE_URL
npm run dev
```

Abre `http://localhost:3000`. Para que Mercado Pago acceda al webhook y a las URLs de retorno, `NEXT_PUBLIC_BASE_URL` debe ser una URL HTTPS pública que apunte a la aplicación.

## Endpoints

- `POST /api/create-preference`: usa el SDK oficial de Node, configura `integratorId`, valida la cantidad, fija producto/precio en servidor y crea la preferencia.
- `POST /api/webhooks/mercadopago`: valida la firma si existe `MERCADOPAGO_WEBHOOK_SECRET`, consulta el pago y responde `200`.
- `/resultado/aprobado`, `/resultado/pendiente`, `/resultado/rechazado`.

El frontend inicializa `@mercadopago/sdk-react` con la Public Key y renderiza el componente `Wallet` usando el `preferenceId` recibido del backend. La preferencia limita el pago a 6 cuotas, excluye Visa y usa `MERCADOPAGO_ACCOUNT_EMAIL` como `external_reference`. Usa credenciales y usuarios de prueba para la certificación. Nunca expongas el access token en código cliente.
