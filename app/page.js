"use client";

import { useState } from "react";
import { initMercadoPago, Wallet } from "@mercadopago/sdk-react";

const publicKey = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY;
if (publicKey) initMercadoPago(publicKey, { locale: "es-PE" });

const product = {
  id: "4827",
  title: "Taza Nómada",
  description: "Dispositivo de tienda móvil de comercio electrónico",
  price: 79.9,
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
    setQuantity(Math.max(0, nextQuantity));
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
        <a className="brand" href="#">NÓMADA<span>®</span></a>
        <div className="cart-pill">Carrito <strong>{quantity}</strong></div>
      </nav>

      <section className="hero">
        <div className="eyebrow">EDICIÓN DE ESTUDIO · 01</div>
        <div className="product-visual" aria-label="Ilustración de una taza color terracota">
          <div className="sun" />
          <div className="mug"><div className="mug-mark">N</div></div>
          <div className="shadow" />
          <span className="scribble">hecha para<br />seguir creando</span>
        </div>

        <div className="product-copy">
          <div className="badge">NUEVO</div>
          <h1>{product.title}</h1>
          <p>{product.description}</p>
          <div className="price">{money.format(product.price)}</div>
          <button className="primary" disabled={quantity === 1} onClick={() => changeQuantity(1)}>
            {quantity === 1 ? "Producto agregado" : "Agregar al carrito"} <span>{quantity === 1 ? "✓" : "+"}</span>
          </button>
          <div className="details"><span>↗ Envío nacional</span><span>◌ Pago seguro</span></div>
        </div>
      </section>

      <section className="cart-section">
        <div>
          <div className="eyebrow">TU SELECCIÓN</div>
          <h2>Carrito</h2>
        </div>

        {quantity === 0 ? (
          <div className="empty">Tu carrito está esperando una buena idea.</div>
        ) : (
          <div className="cart-card">
            <div className="mini-mug">N</div>
            <div className="item-info"><strong>{product.title}</strong><span>{money.format(product.price)} c/u</span></div>
            <div className="stepper">
              <button aria-label="Quitar producto" onClick={() => changeQuantity(0)}>−</button>
              <span>{quantity}</span>
              <button aria-label="Cantidad máxima alcanzada" disabled>+</button>
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

      <footer><span>NÓMADA STORE</span><span>Integración Checkout Pro · Mercado Pago</span></footer>
    </main>
  );
}
