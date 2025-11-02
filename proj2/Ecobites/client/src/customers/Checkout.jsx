import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const cart = location.state?.cart || [];

  const [deliveryAddress, setDeliveryAddress] = useState({
    name: '',
    address: '',
    city: '',
    zip: '',
    phone: '',
  });

  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card' or 'cod'

  const [payment, setPayment] = useState({
    cardNumber: '',
    expiry: '',
    cvv: '',
    name: '',
  });

  const [isProcessing, setIsProcessing] = useState(false);

  const formatCurrency = (num) => {
    return Number(num).toLocaleString(undefined, { style: 'currency', currency: 'USD' });
  };

  const getTotal = () => {
    return cart.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0).toFixed(2);
  };

  const handleAddressChange = (e) => {
    setDeliveryAddress({ ...deliveryAddress, [e.target.name]: e.target.value });
  };

  const handlePaymentChange = (e) => {
    setPayment({ ...payment, [e.target.name]: e.target.value });
  };

  const handleConfirmOrder = () => {
    if (!deliveryAddress.name || !deliveryAddress.address) {
      alert('Please fill in all required fields.');
      return;
    }
    if (paymentMethod === 'card' && (!payment.cardNumber || !payment.expiry || !payment.cvv || !payment.name)) {
      alert('Please fill in all card details.');
      return;
    }
    setIsProcessing(true);
    // Mock processing
    setTimeout(() => {
      alert('Order confirmed! Thank you for your purchase.');
      // Clear cart logic would go here if using context
      navigate('/customer');
    }, 2000);
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 pt-24">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-800">No items in cart</h1>
          <button onClick={() => navigate('/customer')} className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">Back to Restaurants</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50 p-6 pt-24">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <button
            onClick={() => navigate('/customer')}
            className="mb-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
          >
            ← Back to Restaurants
          </button>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent mb-2">Checkout</h1>
          <p className="text-gray-600">Complete your order with ease</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="bg-white rounded-xl p-6 shadow-lg border border-emerald-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                <span className="text-emerald-600 text-sm font-bold">🛒</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-800">Order Summary</h2>
            </div>
            <ul className="divide-y divide-gray-100">
              {cart.map((item, idx) => (
                <li key={idx} className="py-3 flex justify-between">
                  <div>
                    <div className="font-medium text-gray-800">{item.name}</div>
                    <div className="text-sm text-gray-500">{item.restaurant} x {item.quantity}</div>
                  </div>
                  <div className="font-semibold text-emerald-600">{formatCurrency(item.price * item.quantity)}</div>
                </li>
              ))}
            </ul>
            <div className="mt-4 border-t border-emerald-200 pt-4 flex justify-between bg-emerald-50 -mx-6 -mb-6 px-6 py-4 rounded-b-xl">
              <div className="text-lg font-semibold text-gray-800">Total</div>
              <div className="text-lg font-bold text-emerald-600">{formatCurrency(getTotal())}</div>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="bg-white rounded-xl p-6 shadow-lg border border-emerald-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                <span className="text-emerald-600 text-sm font-bold">📍</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-800">Delivery Address</h2>
            </div>
            <form className="space-y-4">
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={deliveryAddress.name}
                onChange={handleAddressChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                required
              />
              <input
                type="text"
                name="address"
                placeholder="Street Address"
                value={deliveryAddress.address}
                onChange={handleAddressChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                required
              />
              <div className="flex gap-3">
                <input
                  type="text"
                  name="city"
                  placeholder="City"
                  value={deliveryAddress.city}
                  onChange={handleAddressChange}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
                <input
                  type="text"
                  name="zip"
                  placeholder="ZIP Code"
                  value={deliveryAddress.zip}
                  onChange={handleAddressChange}
                  className="w-32 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </div>
              <input
                type="tel"
                name="phone"
                placeholder="Phone Number"
                value={deliveryAddress.phone}
                onChange={handleAddressChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
            </form>
          </div>

          {/* Payment Method Selection */}
          <div className="bg-white rounded-xl p-6 shadow-lg border border-emerald-100 lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                <span className="text-emerald-600 text-sm font-bold">💳</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-800">Payment Method</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <label className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                paymentMethod === 'card'
                  ? 'border-emerald-500 bg-emerald-50 shadow-md'
                  : 'border-gray-200 hover:border-emerald-300'
              }`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="card"
                  checked={paymentMethod === 'card'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="text-emerald-600 focus:ring-emerald-500"
                />
                <div className="flex items-center gap-2">
                  <span className="text-2xl">💳</span>
                  <span className="font-medium text-gray-800">Credit/Debit Card</span>
                </div>
              </label>
              <label className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                paymentMethod === 'cod'
                  ? 'border-emerald-500 bg-emerald-50 shadow-md'
                  : 'border-gray-200 hover:border-emerald-300'
              }`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={paymentMethod === 'cod'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="text-emerald-600 focus:ring-emerald-500"
                />
                <div className="flex items-center gap-2">
                  <span className="text-2xl">💵</span>
                  <span className="font-medium text-gray-800">Cash on Delivery</span>
                </div>
              </label>
            </div>

            {paymentMethod === 'card' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <span className="text-emerald-600">🔒</span>
                  Card Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="cardNumber"
                    placeholder="Card Number"
                    value={payment.cardNumber}
                    onChange={handlePaymentChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    required
                  />
                  <input
                    type="text"
                    name="name"
                    placeholder="Name on Card"
                    value={payment.name}
                    onChange={handlePaymentChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    required
                  />
                  <input
                    type="text"
                    name="expiry"
                    placeholder="MM/YY"
                    value={payment.expiry}
                    onChange={handlePaymentChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    required
                  />
                  <input
                    type="text"
                    name="cvv"
                    placeholder="CVV"
                    value={payment.cvv}
                    onChange={handlePaymentChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
              </div>
            )}

            {paymentMethod === 'cod' && (
              <div className="bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-200 rounded-lg p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">💵</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-emerald-800 text-lg">Cash on Delivery</h3>
                    <p className="text-sm text-emerald-600 mt-1">Pay with cash when your order arrives at your doorstep. No card required!</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={handleConfirmOrder}
            disabled={isProcessing}
            className="px-10 py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl disabled:opacity-60 hover:from-emerald-700 hover:to-emerald-600 transition-all transform hover:scale-105"
          >
            {isProcessing ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Processing...
              </div>
            ) : (
              'Confirm Order'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
