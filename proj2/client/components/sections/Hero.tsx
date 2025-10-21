import { Button } from "@/components/ui/button";

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute -z-10 inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-50 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(90%_70%_at_50%_-10%,hsl(var(--primary)/0.35),transparent_60%)]" />
      </div>
      <div className="container py-20 md:py-28 text-center">
        <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          EcoBites • Group 22
        </span>
        <h1 className="mt-6 text-4xl md:text-6xl font-extrabold tracking-tight">
          “Helping You, Help the Planet”
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base md:text-lg text-foreground/70">
          Redefining food delivery with sustainability at its core. Make every meal an eco‑conscious choice with transparent impact and rewarding green actions.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button size="lg" asChild>
            <a href="#whats-new">See What's New here</a>
          </Button>
          <Button size="lg" variant="secondary" asChild>
            <a href="#mission">Our Mission</a>
          </Button>
        </div>
      </div>
    </section>
  );
}
