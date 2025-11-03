export const formatPrice = (price) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
};

export const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

export const calculateOrderTotal = (items, deliveryFee = 5) => {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + deliveryFee + tax;
  
  return {
    subtotal: subtotal.toFixed(2),
    deliveryFee: deliveryFee.toFixed(2),
    tax: tax.toFixed(2),
    total: total.toFixed(2),
  };
};

export const getOrderStatusColor = (status) => {
  const colors = {
    PLACED: 'blue',
    RECEIVED: 'purple',
    ACCEPTED: 'green',
    PREPARING: 'orange',
    READY: 'yellow',
    DRIVER_ASSIGNED: 'indigo',
    PICKED_UP: 'cyan',
    OUT_FOR_DELIVERY: 'blue',
    DELIVERED: 'green',
    CANCELLED: 'red',
  };
  return colors[status] || 'gray';
};