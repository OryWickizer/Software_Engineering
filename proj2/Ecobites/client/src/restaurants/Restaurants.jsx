import React from 'react';
import { Link } from 'react-router-dom';

export default function Restaurants() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-2">Restaurants</h1>
      <p className="text-gray-600 mb-8">Manage your menu and handle incoming customer orders.</p>

      <div className="grid gap-6 md:grid-cols-2">
        <Link to="/restaurants/menu" className="group block">
          <div className="h-full rounded-2xl border bg-white p-6 shadow-sm transition-all group-hover:shadow-md group-hover:border-emerald-300">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Menu Items</h2>
              <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">Manage</span>
            </div>
            <p className="mt-2 text-gray-600">Create, edit, and organize the items on your restaurant menu.</p>
            <div className="mt-4">
              <span className="inline-block rounded-lg bg-emerald-600 text-white px-4 py-2 text-sm font-medium">Go to Menu</span>
            </div>
          </div>
        </Link>

        <Link to="/restaurants/orders" className="group block">
          <div className="h-full rounded-2xl border bg-white p-6 shadow-sm transition-all group-hover:shadow-md group-hover:border-emerald-300">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Customer Orders</h2>
              <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">Live</span>
            </div>
            <p className="mt-2 text-gray-600">Accept or reject orders and track their status in real time.</p>
            <div className="mt-4">
              <span className="inline-block rounded-lg bg-emerald-600 text-white px-4 py-2 text-sm font-medium">Go to Orders</span>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
