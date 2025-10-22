import React, { useState } from 'react'

interface MenuItem {
  name: string;
  description: string;
  price: number;
  category: string;
}

const Customer = () => {
  // Example items (can be replaced later with fetched data)
  const [menuItems] = useState<MenuItem[]>([
    { name: 'Margherita Pizza', description: 'Classic cheese pizza', price: 9.99, category: 'Pizza' },
    { name: 'Caesar Salad', description: 'Crisp romaine lettuce with Caesar dressing', price: 6.49, category: 'Salad' },
    { name: 'Spaghetti Bolognese', description: 'Pasta with meat sauce', price: 11.5, category: 'Pasta' },
  ]);

  const [cart, setCart] = useState<MenuItem[]>([]);
  const [isCheckout, setIsCheckout] = useState(false);

  // Add item to cart
  const addToCart = (item: MenuItem) => {
    setCart([...cart, item]);
  };

  // Remove item from cart
  const removeFromCart = (index: number) => {
    const updatedCart = [...cart];
    updatedCart.splice(index, 1);
    setCart(updatedCart);
  };

  // Calculate total
  const getTotal = () => {
    return cart.reduce((sum, item) => sum + item.price, 0).toFixed(2);
  };

  // Checkout handler
  const handleCheckout = () => {
    setIsCheckout(true);
    // Later you could send order details to backend here
    setTimeout(() => {
      alert('Thank you for your order!');
      setCart([]);
      setIsCheckout(false);
    }, 500);
  };

  return (
    <div>
        Customer Page

        <button className='bg-green-700 text-white px-4 py-2 rounded'>Add Item</button>
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Customer Page</h1>

      {/* Menu Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Menu</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {menuItems.map((item, index) => (
            <div key={index} className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-2">{item.name}</h3>
              <p className="text-gray-600 mb-2">{item.description}</p>
              <p className="text-lg font-bold text-green-600">${item.price.toFixed(2)}</p>
              <p className="text-sm text-gray-500 mt-2">Category: {item.category}</p>
              <button
                onClick={() => addToCart(item)}
                className="mt-3 bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-sm"
              >
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Cart Section */}
      <div className="bg-gray-100 p-6 rounded-lg">
        <h2 className="text-2xl font-semibold mb-4">Your Cart</h2>
        {cart.length === 0 ? (
          <p className="text-gray-600">Your cart is empty.</p>
        ) : (
          <>
            <ul className="divide-y divide-gray-300">
              {cart.map((item, index) => (
                <li key={index} className="py-2 flex justify-between items-center">
                  <div>
                    <span className="font-medium">{item.name}</span> - ${item.price.toFixed(2)}
                  </div>
                  <button
                    onClick={() => removeFromCart(index)}
                    className="bg-red-500 hover:bg-red-700 text-white py-1 px-3 rounded text-sm"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex justify-between items-center">
              <p className="text-lg font-bold">Total: ${getTotal()}</p>
              <button
                onClick={handleCheckout}
                disabled={isCheckout}
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
              >
                {isCheckout ? 'Processing...' : 'Checkout'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Customer;
