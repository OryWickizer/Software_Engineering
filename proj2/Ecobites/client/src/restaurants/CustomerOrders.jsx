import React, { useState } from 'react';

export default function CustomerOrders() {
  const [ordersTab, setOrdersTab] = useState('incoming'); // incoming | accepted | rejected
  const [orders, setOrders] = useState([
    {
      id: 1,
      customer: 'Alice Johnson',
      createdAt: new Date().toISOString(),
      items: [
        { name: 'Margherita Pizza', qty: 1, price: 9.99 },
        { name: 'Caesar Salad', qty: 2, price: 6.49 },
      ],
      notes: 'No croutons in the salad, please.',
      status: 'incoming',
    },
    {
      id: 2,
      customer: 'Michael Chen',
      createdAt: new Date().toISOString(),
      items: [
        { name: 'Spaghetti Bolognese', qty: 1, price: 11.5 },
      ],
      notes: '',
      status: 'incoming',
    },
    {
      id: 3,
      customer: 'Sara Patel',
      createdAt: new Date().toISOString(),
      items: [
        { name: 'Margherita Pizza', qty: 2, price: 9.99 },
      ],
      notes: 'Extra basil if possible.',
      status: 'incoming',
    },
  ]);

  const orderTotal = (order) => order.items.reduce((sum, it) => sum + it.price * it.qty, 0);

  const acceptOrder = (id) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: 'accepted' } : o)));
  };

  const rejectOrder = (id) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: 'rejected' } : o)));
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-2">Customer Orders</h1>
      <p className="text-gray-600 mb-6">Accept or reject incoming orders and track status.</p>

      <div className="flex gap-2 mb-4">
        {['incoming', 'accepted', 'rejected'].map((tab) => (
          <button
            key={tab}
            onClick={() => setOrdersTab(tab)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              ordersTab === tab
                ? 'bg-emerald-600 text-white'
                : 'bg-white text-gray-600 hover:bg-emerald-50'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {orders.filter((o) => o.status === ordersTab).length === 0 && (
          <div className="col-span-full bg-white p-6 rounded-lg shadow text-gray-600">
            {ordersTab === 'incoming' ? 'No incoming orders right now.' : 'No orders in this category.'}
          </div>
        )}

        {orders
          .filter((o) => o.status === ordersTab)
          .map((order) => (
            <div key={order.id} className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-lg font-semibold">{order.customer}</h3>
                  <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleString()}</p>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    order.status === 'incoming'
                      ? 'bg-yellow-100 text-yellow-700'
                      : order.status === 'accepted'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {order.status}
                </span>
              </div>

              <div className="mt-3 border-t pt-3">
                <ul className="space-y-1">
                  {order.items.map((it, idx) => (
                    <li key={idx} className="text-sm text-gray-700 flex justify-between">
                      <span>
                        {it.qty} × {it.name}
                      </span>
                      <span className="text-gray-600">${(it.price * it.qty).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>

                {order.notes && (
                  <p className="mt-3 text-sm text-gray-600">
                    <span className="font-medium">Notes: </span>
                    {order.notes}
                  </p>
                )}

                <div className="mt-3 flex items-center justify-between">
                  <p className="text-base font-semibold text-emerald-700">
                    Total: ${orderTotal(order).toFixed(2)}
                  </p>

                  {ordersTab === 'incoming' ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => acceptOrder(order.id)}
                        className="bg-emerald-500 hover:bg-emerald-700 text-white font-bold py-1.5 px-3 rounded text-sm"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => rejectOrder(order.id)}
                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-1.5 px-3 rounded text-sm"
                      >
                        Reject
                      </button>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 italic">
                      {ordersTab === 'accepted' ? 'Accepted' : 'Rejected'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
