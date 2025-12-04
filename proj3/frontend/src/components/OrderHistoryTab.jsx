/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ShoppingBag, Package, Clock, CheckCircle, DollarSign, AlertCircle } from 'lucide-react';
import DisputeForm from './DisputeForm';

const TYPE_COLORS = {
  sale: 'bg-green-100 text-green-800',
  swap: 'bg-blue-100 text-blue-800'
};

const STATUS_COLORS = {
  completed: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  cancelled: 'bg-red-100 text-red-800'
};

export default function OrderHistoryTab() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [disputeFormOpen, setDisputeFormOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);

    try {
      const userEmail = localStorage.getItem('email');
      const response = await fetch('http://localhost:8000/api/transactions/my-orders', {
        headers: {
          'Authorization': `Bearer ${userEmail}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch order history');
      }

      const data = await response.json();
      setOrders(data);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleFileDispute = (order) => {
    setSelectedOrder(order);
    setDisputeFormOpen(true);
  };

  const handleDisputeFiled = () => {
    // Refresh orders after dispute is filed
    fetchOrders();
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="flex justify-center items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p>Loading your order history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-600">
        <AlertCircle className="w-16 h-16 mx-auto mb-4" />
        <p>Error loading orders: {error}</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12 space-y-4">
        <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground" />
        <h3 className="text-xl font-semibold">No Orders Yet</h3>
        <p className="text-muted-foreground">
          Your order history will appear here once you make your first purchase or swap.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Order History</h2>
        <p className="text-muted-foreground">
          View all your past purchases and swaps
        </p>
      </div>

      <div className="grid gap-4">
        {orders.map((order) => (
          <Card key={order.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CardTitle className="text-lg">{order.meal_title}</CardTitle>
                    <Badge className={TYPE_COLORS[order.transaction_type]}>
                      {order.transaction_type === 'sale' ? '💰 Purchase' : '🔄 Swap'}
                    </Badge>
                  </div>
                  <CardDescription>
                    {order.meal_cuisine && (
                      <span className="mr-4">🍴 {order.meal_cuisine}</span>
                    )}
                    Seller: {order.seller_name}
                  </CardDescription>
                </div>
                <Badge className={STATUS_COLORS[order.status]}>
                  {order.status === 'completed' && <CheckCircle className="w-3 h-3 mr-1" />}
                  {order.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                  {order.status.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Meal Photo */}
              {order.meal_photos && order.meal_photos.length > 0 && (
                <div className="flex gap-2 overflow-x-auto">
                  {order.meal_photos.slice(0, 3).map((photo, idx) => (
                    <img
                      key={idx}
                      src={photo}
                      alt={`${order.meal_title} ${idx + 1}`}
                      className="w-20 h-20 object-cover rounded-lg border"
                    />
                  ))}
                </div>
              )}

              {/* Order Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                {order.transaction_type === 'sale' && order.amount && (
                  <div className="flex items-center">
                    <DollarSign className="w-4 h-4 mr-2 text-green-600" />
                    <span className="font-semibold">Amount: ${order.amount.toFixed(2)}</span>
                  </div>
                )}
                
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {formatDate(order.created_at)}
                  </span>
                </div>
              </div>

              {order.message && (
                <div className="bg-blue-50 border border-blue-200 rounded p-2">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> {order.message}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              {order.status === 'completed' && (
                <div className="flex justify-end pt-2 border-t">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 border-red-300 hover:bg-red-50"
                    onClick={() => handleFileDispute(order)}
                  >
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Report Issue
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dispute Form Dialog */}
      {selectedOrder && (
        <DisputeForm
          transaction={selectedOrder}
          meal={{
            id: selectedOrder.meal_id,
            title: selectedOrder.meal_title,
            name: selectedOrder.meal_title,
            seller_id: selectedOrder.seller_id,
            seller_name: selectedOrder.seller_name,
            cookName: selectedOrder.seller_name
          }}
          isOpen={disputeFormOpen}
          onClose={() => {
            setDisputeFormOpen(false);
            setSelectedOrder(null);
          }}
          onDisputeFiled={handleDisputeFiled}
        />
      )}
    </div>
  );
}
