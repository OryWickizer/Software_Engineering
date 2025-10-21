export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute -z-10 inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-50 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(90%_70%_at_50%_-10%,hsl(142.1_76.2%_36.3%/0.35),transparent_60%)]" />
      </div>
      
      <div className="container py-20 md:py-28 text-center">
        <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
          EcoBites • Group 22
        </span>
        
        <h1 className="mt-6 text-4xl md:text-6xl font-extrabold tracking-tight">
          "Helping You, Help the Planet"
        </h1>
        
        <p className="mx-auto mt-4 max-w-2xl text-base md:text-lg text-gray-600">
          Redefining food delivery with sustainability at its core. Make every meal an eco‑conscious choice with transparent impact and rewarding green actions.
        </p>
        
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <a href="#whats-new">
            <button className="px-6 py-3 text-base font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors">
              See What's New
            </button>
          </a>
          
          <a href="#mission">
            <button className="px-6 py-3 text-base font-semibold text-gray-800 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors">
              Our Mission
            </button>
          </a>
         
        </div>
      </div>
    </section>
  );
}