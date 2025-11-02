import React, { useEffect, useState, useCallback } from 'react';
import { orderService } from '../api/services/order.service';
import { useAuth } from '../hooks/useAuth';

export default function CustomerOrders() {
  const { user } = useAuth();
  const [ordersTab, setOrdersTab] = useState('incoming'); // incoming | accepted | rejected
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchOrders = useCallback(async () => {
    if (!user || user.role !== 'restaurant') return;
    setLoading(true);
    setError(null);
    try {
      const data = await orderService.getByRole('restaurant', user._id);
      // map server status to UI category (incoming | accepted | rejected)
      const mapStatusToCategory = (status) => {
        const s = (status || '').toString().toUpperCase();
        const incoming = new Set(['PLACED', 'PENDING', 'RECEIVED', 'RECEIVED']);
        const accepted = new Set(['ACCEPTED', 'PREPARING', 'READY', 'DRIVER_ASSIGNED', 'PICKED_UP', 'OUT_FOR_DELIVERY']);
        const rejected = new Set(['CANCELLED']);
        if (incoming.has(s)) return 'incoming';
        if (accepted.has(s)) return 'accepted';
        if (rejected.has(s)) return 'rejected';
        return 'incoming';
      };

      const normalized = data.map((o) => {
        const status = o.status || '';
        return { ...o, status: status.toString(), category: mapStatusToCategory(status) };
      });
      setOrders(normalized);

    } catch (err) {
      console.error('Failed to fetch orders', err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const orderTotal = (order) => (order.items || []).reduce((sum, it) => sum + (it.price || 0) * (it.quantity || it.qty || 1), 0);

  const updateStatus = async (orderId, newStatus) => {
    try {
      const resp = await orderService.updateStatus(orderId, { status: newStatus });
      // update local state with returned order
      // recompute category for the updated order
      const updatedCategory = ((s) => {
        const S = (s || '').toString().toUpperCase();
        const incoming = new Set(['PLACED', 'PENDING', 'RECEIVED']);
        const accepted = new Set(['ACCEPTED', 'PREPARING', 'READY', 'DRIVER_ASSIGNED', 'PICKED_UP', 'OUT_FOR_DELIVERY']);
        const rejected = new Set(['CANCELLED']);
        if (incoming.has(S)) return 'incoming';
        if (accepted.has(S)) return 'accepted';
        if (rejected.has(S)) return 'rejected';
        return 'incoming';
      })(resp.status);

      setOrders((prev) => prev.map((o) => (o._id === resp._id ? { ...resp, status: resp.status, category: updatedCategory } : o)));
    } catch (err) {
      console.error('Failed to update order status', err);
    }
  };

  const acceptOrder = (orderId) => updateStatus(orderId, 'ACCEPTED');
  const sendOrder = (orderId) => updateStatus(orderId, 'READY');
  // use CANCELLED as server-side enum includes CANCELLED (maps to 'rejected' UI)
  const rejectOrder = (orderId) => updateStatus(orderId, 'CANCELLED');

  // UI
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-2">Customer Orders</h1>
      <p className="text-gray-600 mb-6">Accept or reject incoming orders and mark them ready to send to drivers.</p>

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

      {loading && <div className="mb-4 text-sm text-gray-600">Loading orders…</div>}
      {error && <div className="mb-4 text-sm text-red-600">Error: {error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {orders.filter((o) => o.category === ordersTab).length === 0 && (
          <div className="col-span-full bg-white p-6 rounded-lg shadow text-gray-600">
            {ordersTab === 'incoming' ? 'No incoming orders right now.' : 'No orders in this category.'}
          </div>
        )}

        {orders
          .filter((o) => o.category === ordersTab)
          .map((order) => (
            <div key={order._id} className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-lg font-semibold">{order.customerName || order.customer || order.customerId}</h3>
                  <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleString()}</p>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    order.category === 'incoming'
                      ? 'bg-yellow-100 text-yellow-700'
                      : order.category === 'accepted'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {order.status}
                </span>
              </div>

              <div className="mt-3 border-t pt-3">
                <ul className="space-y-1">
                  {(order.items || []).map((it, idx) => (
                    <li key={idx} className="text-sm text-gray-700 flex justify-between">
                      <span>
                        {it.quantity || it.qty || 1} × {it.name}
                      </span>
                      <span className="text-gray-600">${((it.price || 0) * (it.quantity || it.qty || 1)).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>

                {order.specialInstructions && (
                  <p className="mt-3 text-sm text-gray-600">
                    <span className="font-medium">Notes: </span>
                    {order.specialInstructions}
                  </p>
                )}

                <div className="mt-3 flex items-center justify-between">
                  <p className="text-base font-semibold text-emerald-700">
                    Total: ${orderTotal(order).toFixed(2)}
                  </p>

                  {ordersTab === 'incoming' ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => acceptOrder(order._id)}
                        className="bg-emerald-500 hover:bg-emerald-700 text-white font-bold py-1.5 px-3 rounded text-sm"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => rejectOrder(order._id)}
                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-1.5 px-3 rounded text-sm"
                      >
                        Reject
                      </button>
                    </div>
                  ) : ordersTab === 'accepted' ? (
                    <div className="flex gap-2">
                      <div className="text-sm text-gray-500 italic self-center">Accepted</div>
                      <button
                        onClick={() => sendOrder(order._id)}
                        className="bg-emerald-600 hover:bg-emerald-800 text-white font-bold py-1.5 px-3 rounded text-sm"
                      >
                        Mark Ready
                      </button>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 italic">Rejected</div>
                  )}
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
