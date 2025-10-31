import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [restaurantId, setRestaurantId] = useState(null);

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      const parsed = JSON.parse(savedCart);
      setCart(parsed.items || []);
      setRestaurantId(parsed.restaurantId || null);
    }
  }, []);

  const saveCart = (items, restId) => {
    localStorage.setItem('cart', JSON.stringify({ items, restaurantId: restId }));
  };

  const addToCart = (item, restId) => {
    if (restaurantId && restaurantId !== restId) {
      if (!confirm('This will clear your current cart. Continue?')) {
        return;
      }
      setCart([item]);
      setRestaurantId(restId);
      saveCart([item], restId);
    } else {
      const existing = cart.find(i => i.menuItemId === item.menuItemId);
      let newCart;
      
      if (existing) {
        newCart = cart.map(i =>
          i.menuItemId === item.menuItemId
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      } else {
        newCart = [...cart, { ...item, quantity: 1 }];
      }
      
      setCart(newCart);
      setRestaurantId(restId);
      saveCart(newCart, restId);
    }
  };

  const removeFromCart = (menuItemId) => {
    const newCart = cart.filter(item => item.menuItemId !== menuItemId);
    setCart(newCart);
    if (newCart.length === 0) {
      setRestaurantId(null);
    }
    saveCart(newCart, restaurantId);
  };

  const updateQuantity = (menuItemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(menuItemId);
      return;
    }
    
    const newCart = cart.map(item =>
      item.menuItemId === menuItemId ? { ...item, quantity } : item
    );
    setCart(newCart);
    saveCart(newCart, restaurantId);
  };

  const clearCart = () => {
    setCart([]);
    setRestaurantId(null);
    localStorage.removeItem('cart');
  };

  const getTotalItems = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  const getSubtotal = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        restaurantId,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalItems,
        getSubtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};