"use client";

import { useState } from "react";
import { initMercadoPago, Wallet } from "@mercadopago/sdk-react";

const publicKey = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY;
if (publicKey) initMercadoPago(publicKey, { locale: "es-PE" });

const product = {
  id: "1001",
  title: "Ventilador 5 velocidades",
  description: "Ventilador práctico de 5 velocidades, ideal para refrescar tu casa, oficina o negocio.",
  price: 100,
};

const money = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
});

export default function Home() {
  const [quantity, setQuantity] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [preferenceId, setPreferenceId] = useState("");

  function changeQuantity(nextQuantity) {
    setQuantity(Math.min(10, Math.max(0, nextQuantity)));
    setPreferenceId("");
    setError("");
  }

  async function checkout() {
    setLoading(true);
    setError("");
    setPreferenceId("");

    try {
      const response = await fetch("/api/create-preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "No se pudo iniciar el pago");

      setPreferenceId(data.preferenceId);
      setLoading(false);
    } catch (checkoutError) {
      setError(checkoutError.message);
      setLoading(false);
    }
  }

  return (
    <main>
      <nav className="nav">
        <a className="brand" href="#">VENTIFAN<span>®</span></a>
        <div className="cart-pill">Carrito <strong>{quantity}</strong></div>
      </nav>

      <section className="hero">
        <div className="eyebrow">VENTILACIÓN PARA TU DÍA</div>
        <div className="product-visual" aria-label="Ilustración de un ventilador">
          <div className="sun" />
          <div className="fan">
            <div className="fan-blades"><span /><span /><span /></div>
            <div className="fan-center" />
            <div className="fan-stand" />
            <div className="fan-base" />
          </div>
          <div className="shadow" />
          <span className="scribble">5 velocidades<br />más frescura</span>
        </div>

        <div className="product-copy">
          <div className="badge">DISPONIBLE</div>
          <h1>{product.title}</h1>
          <p>{product.description}</p>
          <div className="price">{money.format(product.price)}</div>
          <button className="primary" disabled={quantity > 0} onClick={() => changeQuantity(1)}>
            {quantity > 0 ? "Producto agregado" : "Agregar al carrito"} <span>{quantity > 0 ? "✓" : "+"}</span>
          </button>
          <div className="details"><span>↗ Entrega coordinada</span><span>◌ Pago seguro con Mercado Pago</span></div>
        </div>
      </section>

      <section className="cart-section">
        <div>
          <div className="eyebrow">TU SELECCIÓN</div>
          <h2>Carrito</h2>
        </div>

        {quantity === 0 ? (
          <div className="empty">Tu carrito está vacío. Agrega tu ventilador para continuar.</div>
        ) : (
          <div className="cart-card">
            <div className="mini-fan">✺</div>
            <div className="item-info"><strong>{product.title}</strong><span>{money.format(product.price)} c/u</span></div>
            <div className="stepper">
              <button aria-label="Reducir cantidad" onClick={() => changeQuantity(quantity - 1)}>−</button>
              <span>{quantity}</span>
              <button aria-label="Aumentar cantidad" disabled={quantity >= 10} onClick={() => changeQuantity(quantity + 1)}>+</button>
            </div>
            <div className="total"><span>Total</span><strong>{money.format(product.price * quantity)}</strong></div>
            {!preferenceId && (
              <button className="pay" disabled={loading || !publicKey} onClick={checkout}>
                {loading ? "Creando preferencia…" : "Pagar con Mercado Pago"}
                <span>→</span>
              </button>
            )}
            {!publicKey && <p className="error" role="alert">Falta NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY en .env.local</p>}
            {preferenceId && (
              <div className="wallet-container">
                <small className="preference">Preferencia creada: {preferenceId}</small>
                <Wallet
                  initialization={{ preferenceId }}
                  customization={{ texts: { valueProp: "smart_option" } }}
                  onError={(walletError) => setError(walletError?.message || "No se pudo cargar Checkout Pro")}
                />
              </div>
            )}
            {error && <p className="error" role="alert">{error}</p>}
          </div>
        )}
      </section>

      <footer><span>VENTIFAN STORE</span><span>Pagos seguros con Mercado Pago</span></footer>
    </main>
  );
}
