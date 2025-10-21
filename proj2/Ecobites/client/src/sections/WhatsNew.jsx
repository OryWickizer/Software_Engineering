// import { PackageCheck, Users, Bike, Leaf } from "lucide-react";

// const items = [
//   {
//     title: "Eco Packaging Selection",
//     desc:
//       "Choose reusable, compostable, or minimal packaging—and earn rewards for sustainable choices.",
//     Icon: PackageCheck,
//   },
//   {
//     title: "Community Sharing / Group Orders",
//     desc:
//       "Combine orders with neighbors or coworkers to reduce trips and unlock shared‑order discounts.",
//     Icon: Users,
//   },
//   {
//     title: "Delivery Rewards",
//     desc:
//       "Drivers using bikes, EVs, or low‑emission methods earn incentives for greener deliveries.",
//     Icon: Bike,
//   },
//   {
//     title: "Seasonal Menu Highlight",
//     desc:
//       "Enjoy seasonal ingredients that lower environmental impact from long‑distance imports.",
//     Icon: Leaf,
//   },
// ];

// export default function WhatsNew() {
//   return (
//     <section id="whats-new" className="container py-16 md:py-24">
//       <div className="text-center max-w-3xl mx-auto">
//         <h2 className="text-2xl md:text-3xl font-bold">What's New</h2>
//         <p className="mt-2 text-foreground/60">Four impactful improvements to make sustainable eating effortless.</p>
//       </div>
//       <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
//         {items.map(({ title, desc, Icon }) => (
//           <div key={title} className="group rounded-2xl border border-emerald-200/40 bg-card p-6 shadow-sm transition hover:shadow-md hover:border-emerald-400/60">
//             <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
//               <Icon className="h-5 w-5" />
//             </div>
//             <h3 className="mt-4 text-base font-semibold">{title}</h3>
//             <p className="mt-2 text-sm text-foreground/70">{desc}</p>
//           </div>
//         ))}
//       </div>
//     </section>
//   );
// }
