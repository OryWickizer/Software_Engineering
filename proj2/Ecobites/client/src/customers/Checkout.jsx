import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { orderService } from '../api/services/order.service';
import { useAuthContext } from '../hooks/useAuthContext';
import { PACKAGING_OPTIONS, PACKAGING_LABELS, ECO_REWARDS } from '../utils/constants';

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthContext();
  const cart = location.state?.cart || [];

  // Hooks must be called unconditionally at the top of the component.

  // Prefill address from user if available
  const getUserAddress = (u) => {
    if (!u || !u.address) return {
      name: u?.name || '',
      address: '', city: '', zip: '', phone: u?.phone || ''
    };
    return {
      name: u.name || '',
      address: u.address.street || '',
      city: u.address.city || '',
      zip: u.address.zipCode || '',
      phone: u.phone || ''
    };
  };
  const [useSavedAddress, setUseSavedAddress] = useState(true);
  const [deliveryAddress, setDeliveryAddress] = useState(() => getUserAddress(user));

  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card' or 'cod'

  const [payment, setPayment] = useState({
    cardNumber: '',
    expiry: '',
    cvv: '',
    name: '',
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [packagingPreference, setPackagingPreference] = useState(PACKAGING_OPTIONS.MINIMAL);

  // Redirect to login when user is not authenticated. Do this in an effect
  // so hooks remain in the same order across renders.

  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location } });
    }
    // If user changes, update address only if using saved address
    if (useSavedAddress) {
      setDeliveryAddress(getUserAddress(user));
    }
  }, [isAuthenticated, navigate, location, user, useSavedAddress]);

  // Packaging choices from constants
  const packagingChoices = [
    { value: PACKAGING_OPTIONS.REUSABLE, label: PACKAGING_LABELS[PACKAGING_OPTIONS.REUSABLE], reward: ECO_REWARDS[PACKAGING_OPTIONS.REUSABLE], desc: 'Returnable container, highest reward' },
    { value: PACKAGING_OPTIONS.COMPOSTABLE, label: PACKAGING_LABELS[PACKAGING_OPTIONS.COMPOSTABLE], reward: ECO_REWARDS[PACKAGING_OPTIONS.COMPOSTABLE], desc: 'Compost-friendly materials' },
    { value: PACKAGING_OPTIONS.MINIMAL, label: PACKAGING_LABELS[PACKAGING_OPTIONS.MINIMAL], reward: ECO_REWARDS[PACKAGING_OPTIONS.MINIMAL], desc: 'Reduced packaging footprint' }
  ];

  const formatCurrency = (num) => {
    return Number(num).toLocaleString(undefined, { style: 'currency', currency: 'USD' });
  };

  const getTotal = () => {
    return cart.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0).toFixed(2);
  };


  const handleAddressChange = (e) => {
    setDeliveryAddress({ ...deliveryAddress, [e.target.name]: e.target.value });
    if (useSavedAddress) setUseSavedAddress(false);
  };

  const handlePaymentChange = (e) => {
    setPayment({ ...payment, [e.target.name]: e.target.value });
  };

  const handleConfirmOrder = async () => {
    if (!deliveryAddress.name || !deliveryAddress.address) {
      alert('Please fill in all required fields.');
      return;
    }
    if (paymentMethod === 'card' && (!payment.cardNumber || !payment.expiry || !payment.cvv || !payment.name)) {
      alert('Please fill in all payment details.');
      return;
    }

    try {
    setIsProcessing(true);

      // Determine customer id robustly (support _id, id, nested $oid)
      const extractId = (u) => {
        if (!u) return null;
        if (typeof u === 'string') return u;
        if (u._id && typeof u._id === 'string') return u._id;
        // handle cases where _id may be an object like { $oid: '...' }
        if (u._id && typeof u._id === 'object' && u._id.$oid) return u._id.$oid;
        if (u.id) return u.id;
        return null;
      };

      const customerId = extractId(user);
      if (!customerId) {
        console.error('No authenticated customer id available on user object:', user);
        alert('Unable to determine customer id. Please log out and log in again.');
        setIsProcessing(false);
        return;
      }

      // Prepare order data in the full shape you requested.
      // Note: server will still validate/override authoritative fields (customerId from token, restaurantId from menu items, prices/totals)
      const itemsForPayload = cart.map(item => ({
        menuItemId: item.menuItemId || item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity || 1
      }));

  const subtotalClient = parseFloat(getTotal());
      const deliveryFeeClient = 5;
      const taxClient = 0;
      const totalClient = +(subtotalClient + deliveryFeeClient + taxClient).toFixed(2);

      const orderData = {
        customerId: customerId, // extracted from authenticated user above
        restaurantId: cart[0]?.restaurantId || null,
        items: itemsForPayload,
        deliveryAddress: {
          street: deliveryAddress.address,
          city: deliveryAddress.city,
          zipCode: deliveryAddress.zip,
        },
        subtotal: subtotalClient,
        deliveryFee: deliveryFeeClient,
        tax: taxClient,
        total: totalClient,
        paymentMethod: paymentMethod,
        specialInstructions: '',
        packagingPreference
      };
      console.log('Order Data:', orderData);
      // Create the order
      const response = await orderService.create(orderData);
      
      if (response) {
        // Clear cart and redirect to order status page
        navigate('/customer/orders');
      } else {
        throw new Error('Failed to create order');
      }
    } catch (error) {
      console.error('Order creation failed:', error);
      alert('Failed to create order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
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
  <div className="min-h-screen bg-linear-to-br from-emerald-50 to-green-50 p-6 pt-24">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <button
            onClick={() => navigate('/customer')}
            className="mb-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
          >
            ← Back to Restaurants
          </button>
          <h1 className="text-4xl font-bold bg-linear-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent mb-2">Checkout</h1>
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
            {user?.address && (
              <div className="mb-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={useSavedAddress}
                  onChange={() => {
                    if (!useSavedAddress) {
                      setDeliveryAddress(getUserAddress(user));
                    }
                    setUseSavedAddress(!useSavedAddress);
                  }}
                  id="useSavedAddress"
                  className="mr-2"
                />
                <label htmlFor="useSavedAddress" className="text-sm text-gray-700 cursor-pointer">
                  Use saved address
                </label>
              </div>
            )}
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
              <div className="bg-linear-to-r from-emerald-50 to-green-50 border-2 border-emerald-200 rounded-lg p-6">
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

            {/* Eco Packaging Preference */}
            <div className="mt-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                  <span className="text-emerald-600 text-sm font-bold">🌿</span>
                </div>
                <h2 className="text-xl font-semibold text-gray-800">Packaging Preference</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {packagingChoices.map(choice => (
                  <label key={choice.value} className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    packagingPreference === choice.value ? 'border-emerald-500 bg-emerald-50 shadow-md' : 'border-gray-200 hover:border-emerald-300'
                  }`}>
                    <input
                      type="radio"
                      name="packagingPreference"
                      value={choice.value}
                      checked={packagingPreference === choice.value}
                      onChange={(e) => setPackagingPreference(e.target.value)}
                      className="mt-1 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <div className="font-medium text-gray-800">{choice.label}</div>
                      <div className="text-sm text-emerald-700">Earn +{choice.reward} eco points</div>
                      <div className="text-xs text-gray-500 mt-1">{choice.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={handleConfirmOrder}
            disabled={isProcessing}
            className="px-10 py-4 bg-linear-to-r from-emerald-600 to-emerald-500 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl disabled:opacity-60 hover:from-emerald-700 hover:to-emerald-600 transition-all transform hover:scale-105"
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
