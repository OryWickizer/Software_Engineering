export default function Mission() {
  return (
    <section id="mission" className="container py-16 md:py-24">
      <div className="grid gap-8 md:grid-cols-12 items-start">
        <div className="md:col-span-4">
          <h2 className="text-2xl md:text-3xl font-bold">Mission Statement</h2>
          <p className="mt-2 text-foreground/60">At EcoBites, we empower customers to make every meal an eco‑conscious choice.</p>
        </div>
        <div className="md:col-span-8">
          <div className="rounded-xl border bg-card p-6 md:p-8 shadow-sm">
            <p className="leading-relaxed text-sm md:text-base text-foreground/80">
              At EcoBites, we are redefining food delivery with sustainability at its core, empowering customers to make every meal an eco‑conscious choice. Through our platform, we provide flexible eco‑friendly options—from reusable or compostable packaging to rewards for low‑carbon delivery methods—while encouraging shared orders to reduce trips.
            </p>
            <p className="mt-4 leading-relaxed text-sm md:text-base text-foreground/80">
              Each meal includes a transparent carbon footprint and seasonal menu highlights to promote responsible consumption. Through interactive challenges, gamification, and personalized impact dashboards, we make sustainable eating engaging, rewarding, and measurable. Our goal is a food delivery experience that benefits people, communities, and the planet—one conscious meal at a time.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
