import Link from "next/link";

const states = {
  aprobado: { icon: "✓", eyebrow: "PAGO CONFIRMADO", title: "¡Todo listo!", text: "Tu pago fue aprobado. Ya podemos preparar tu Taza Nómada.", className: "approved" },
  pendiente: { icon: "…", eyebrow: "PAGO EN REVISIÓN", title: "Estamos pendientes", text: "Mercado Pago está procesando tu pago. Te avisará cuando cambie su estado.", className: "pending" },
  rechazado: { icon: "×", eyebrow: "PAGO NO COMPLETADO", title: "Algo no salió", text: "El pago fue rechazado o cancelado. Puedes volver e intentarlo con otro medio.", className: "rejected" },
};

export default async function ResultPage({ params, searchParams }) {
  const { estado } = await params;
  const query = await searchParams;
  const state = states[estado] || states.rechazado;
  return (
    <main className={`result-page ${state.className}`}>
      <Link className="brand result-brand" href="/">NÓMADA<span>®</span></Link>
      <section className="result-card">
        <div className="result-icon">{state.icon}</div>
        <div className="eyebrow">{state.eyebrow}</div>
        <h1>{state.title}</h1>
        <p>{state.text}</p>
        {query.payment_id && <div className="payment-id">Pago #{query.payment_id}</div>}
        <Link className="primary back" href="/">Volver a la tienda <span>→</span></Link>
      </section>
    </main>
  );
}
