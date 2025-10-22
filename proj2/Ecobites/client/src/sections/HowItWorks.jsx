export default function HowItWorks() {
  return (
    <section id="how-it-works" className="container py-16 md:py-24">
      <div className="text-center max-w-3xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold">How It Works</h2>
        <p className="mt-2 text-foreground/60">Customers, restaurants, and drivers together make deliveries greener.</p>
      </div>
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="text-lg font-semibold">Customers</h3>
          <p className="mt-2 text-sm text-foreground/70">
            Track personal impact, choose sustainable options, and join eco‑friendly challenges. Rewards and transparency make better choices simple and engaging.
          </p>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="text-lg font-semibold">Restaurants</h3>
          <p className="mt-2 text-sm text-foreground/70">
            Offer locally‑sourced, seasonal, plant‑forward menus with eco‑friendly packaging. Showcase sustainability efforts and attract conscious customers.
          </p>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="text-lg font-semibold">Delivery Drivers</h3>
          <p className="mt-2 text-sm text-foreground/70">
            Use low‑emission methods like bikes and EVs, optimize routes, and earn incentives for greener deliveries that reduce carbon footprints.
          </p>
        </div>
      </div>
    </section>
  );
}
