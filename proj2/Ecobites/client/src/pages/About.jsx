import React from 'react';

export default function About() {
  return (
    <div className="pt-20">{/* account for fixed header */}
      {/* Hero/Header */}
      <section className="relative overflow-hidden">
        <div className="absolute -z-10 inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(90%_70%_at_50%_-10%,hsl(142.1_76.2%_36.3%/0.2),transparent_60%)]" />
        </div>
        <div className="container mx-auto px-4 py-14 text-center">
          <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
            About EcoBites
          </span>
          <h1 className="mt-4 text-3xl md:text-5xl font-extrabold tracking-tight">Helping You, Help the Planet</h1>
          <p className="mx-auto mt-3 max-w-2xl text-base md:text-lg text-gray-600">
            EcoBites is redefining food delivery with sustainability at its core. We empower customers, restaurants, and drivers to make greener choices through transparency, incentives, and delightful design.
          </p>
        </div>
      </section>

      {/* Mission and What We Do */}
      <section className="container mx-auto px-4 py-10 grid gap-6 md:grid-cols-12">
        <div className="md:col-span-5">
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Our Mission</h2>
            <p className="mt-2 text-gray-700 leading-relaxed">
              Make every meal an eco‑conscious choice by aligning incentives and providing clear, actionable insights. From compostable packaging to shared routes and EV-friendly deliveries, we make sustainable actions simple and rewarding.
            </p>
          </div>
        </div>
        <div className="md:col-span-7 grid gap-4">
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold">What We Do</h3>
            <ul className="mt-3 space-y-2 text-gray-700">
              <li>• Show transparent carbon and impact indicators per order</li>
              <li>• Reward greener choices for customers and drivers</li>
              <li>• Support restaurants with sustainable menu and packaging options</li>
              <li>• Encourage shared/community orders to reduce trips</li>
            </ul>
          </div>
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold">How It Works</h3>
            <p className="mt-2 text-gray-700">
              Customers choose planet‑friendly options, restaurants showcase sustainability, and drivers optimize eco‑routes and methods. Everyone earns rewards; the planet benefits.
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-6">
        <h2 className="text-2xl font-bold mb-4">Key Features</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h4 className="font-semibold">Impact Transparency</h4>
            <p className="mt-2 text-sm text-gray-700">See estimated impact per order and make informed choices.</p>
          </div>
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h4 className="font-semibold">Eco Rewards</h4>
            <p className="mt-2 text-sm text-gray-700">Earn points for sustainable actions—from packaging to EV deliveries.</p>
          </div>
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h4 className="font-semibold">Community Orders</h4>
            <p className="mt-2 text-sm text-gray-700">Reduce trips and costs by grouping orders within neighborhoods.</p>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="container mx-auto px-4 py-10">
        <h2 className="text-2xl font-bold mb-4">Team</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {["Ory Wickizer", "Stephen Liu", "Yash Dive", "Atharva Waingankar"].map((name) => (
            <div key={name} className="rounded-2xl border bg-white p-6 shadow-sm text-center">
              <div className="mx-auto w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                {name.split(' ').map(n => n[0]).join('')}
              </div>
              <p className="mt-3 font-medium">{name}</p>
              <p className="text-sm text-gray-600">EcoBites • Group 22</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tech */}
      <section className="container mx-auto px-4 py-10">
        <h2 className="text-2xl font-bold mb-4">Technology</h2>
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <p className="text-gray-700">
            Frontend: React + Vite + Tailwind • Routing via React Router • Testing with Vitest/RTL
          </p>
          <p className="text-gray-700 mt-2">
            Backend: Express + Mongoose • JWT Auth • Testing with Jest + Supertest
          </p>
        </div>
      </section>
    </div>
  );
}
