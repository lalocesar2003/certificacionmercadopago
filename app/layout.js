import "./globals.css";

export const metadata = {
  title: "Nómada Store | Checkout Pro",
  description: "Integración de ejemplo con Mercado Pago Checkout Pro",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
