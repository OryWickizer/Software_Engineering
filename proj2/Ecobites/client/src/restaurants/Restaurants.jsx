import React, { useState } from 'react';
import { Link } from 'react-router-dom';


const Restaurant = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [menuItem, setMenuItem] = useState({
    name: '',
    description: '',
    price: '',
    category: ''
  });
  const [menuItems, setMenuItems] = useState([]);

  // Orders state
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
}
  const orderTotal = (order) =>
    order.items.reduce((sum, it) => sum + it.price * it.qty, 0);

  const acceptOrder = (id) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: 'accepted' } : o)));
  };

  const rejectOrder = (id) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: 'rejected' } : o)));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingIndex !== null) {
      const updatedItems = [...menuItems];
      updatedItems[editingIndex] = menuItem;
      setMenuItems(updatedItems);
      setEditingIndex(null);
    } else {
      setMenuItems([...menuItems, menuItem]);
    }
    
    setShowForm(false);
    setMenuItem({ name: '', description: '', price: '', category: '' });
  };

  const handleEdit = (index) => {
    setMenuItem(menuItems[index]);
    setEditingIndex(index);
    setShowForm(true);
  };

  const handleDelete = (index) => {
    const updatedItems = menuItems.filter((_, i) => i !== index);
    setMenuItems(updatedItems);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingIndex(null);
    setMenuItem({ name: '', description: '', price: '', category: '' });
  };

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
