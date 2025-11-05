import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../context/AuthContext';
import { menuService } from '../api/services/menu.service';

export default function MenuItems() {
  const { user } = useAuthContext();
  const [showForm, setShowForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [menuItem, setMenuItem] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    isSeasonal: false,
    seasonalRewardPoints: 0,
    packagingOptions: ['reusable','compostable','minimal']
  });
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch menu items when component loads
  useEffect(() => {
    const fetchMenuItems = async () => {
      if (!user?._id) return;
      
      try {
        setLoading(true);
        const response = await menuService.getByRestaurant(user._id);
        setMenuItems(response || []);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch menu items:', err);
        setError('Failed to load menu items');
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItems();
  }, [user?._id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingIndex !== null) {
        // Update existing menu item
        const itemToUpdate = menuItems[editingIndex];
        await menuService.update(itemToUpdate._id, menuItem);
        
        const updatedItems = [...menuItems];
        updatedItems[editingIndex] = { ...itemToUpdate, ...menuItem };
        setMenuItems(updatedItems);
        setEditingIndex(null);
      } else {
        // Create new menu item
        const newItem = await menuService.create(menuItem);
        setMenuItems([...menuItems, newItem]);
      }

      setShowForm(false);
  setMenuItem({ name: '', description: '', price: '', category: '', isSeasonal: false, seasonalRewardPoints: 0, packagingOptions: ['reusable','compostable','minimal'] });
      setError(null);
    } catch (err) {
      console.error('Failed to save menu item:', err);
      setError('Failed to save menu item');
    }
  };

  const handleEdit = (index) => {
    setMenuItem(menuItems[index]);
    setEditingIndex(index);
    setShowForm(true);
  };

  const handleDelete = async (index) => {
    try {
      const itemToDelete = menuItems[index];
      await menuService.delete(itemToDelete._id);
      
      const updatedItems = menuItems.filter((_, i) => i !== index);
      setMenuItems(updatedItems);
      setError(null);
    } catch (err) {
      console.error('Failed to delete menu item:', err);
      setError('Failed to delete menu item');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingIndex(null);
  setMenuItem({ name: '', description: '', price: '', category: '', isSeasonal: false, seasonalRewardPoints: 0, packagingOptions: ['reusable','compostable','minimal'] });
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-2">Menu Items</h1>
      <p className="text-gray-600 mb-6">Create, edit, and organize your restaurant's offerings.</p>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Loading menu items...</p>
        </div>
      ) : (
        <>
          <div className="mt-4">
            <button
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded"
              onClick={() => setShowForm(!showForm)}
            >
              {showForm ? 'Cancel' : 'Add Item'}
            </button>
          </div>

      {showForm && (
        <div className="mt-6 bg-gray-100 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">
            {editingIndex !== null ? 'Edit Menu Item' : 'Create New Menu Item'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Item Name</label>
              <input
                type="text"
                value={menuItem.name}
                onChange={(e) => setMenuItem({ ...menuItem, name: e.target.value })}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={menuItem.description}
                onChange={(e) => setMenuItem({ ...menuItem, description: e.target.value })}
                className="w-full px-3 py-2 border rounded"
                rows={3}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Price</label>
              <input
                type="number"
                step="0.01"
                value={menuItem.price}
                onChange={(e) => setMenuItem({ ...menuItem, price: e.target.value })}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                value={menuItem.category}
                onChange={(e) => setMenuItem({ ...menuItem, category: e.target.value })}
                className="w-full px-3 py-2 border rounded"
                required
              >
                <option value="">Select a category...</option>
                <option value="appetizer">Appetizer</option>
                <option value="main">Main</option>
                <option value="dessert">Dessert</option>
                <option value="beverage">Beverage</option>
                <option value="side">Side</option>
              </select>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={menuItem.isSeasonal}
                  onChange={(e) => setMenuItem({ ...menuItem, isSeasonal: e.target.checked })}
                />
                Seasonal highlight
              </label>
              {menuItem.isSeasonal && (
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600">Reward Points</label>
                  <input
                    type="number"
                    min={0}
                    value={menuItem.seasonalRewardPoints}
                    onChange={(e) => setMenuItem({ ...menuItem, seasonalRewardPoints: Number(e.target.value || 0) })}
                    className="w-28 px-2 py-1 border rounded"
                  />
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Packaging Options</label>
              <div className="flex flex-wrap gap-3">
                {['reusable','compostable','minimal'].map(opt => (
                  <label key={opt} className="flex items-center gap-2 text-sm capitalize">
                    <input
                      type="checkbox"
                      checked={menuItem.packagingOptions.includes(opt)}
                      onChange={(e) => {
                        setMenuItem(mi => {
                          const has = mi.packagingOptions.includes(opt);
                          return {
                            ...mi,
                            packagingOptions: has ? mi.packagingOptions.filter(o => o !== opt) : [...mi.packagingOptions, opt]
                          };
                        });
                      }}
                    />
                    {opt}
                  </label>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">Shown to customers and used for eco rewards.</p>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
              >
                {editingIndex !== null ? 'Update Item' : 'Create Item'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Your Menu</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {menuItems.map((item, index) => (
            <div key={index} className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-2">{item.name}</h3>
              <p className="text-gray-600 mb-2">{item.description}</p>
              <p className="text-lg font-bold text-green-600">${item.price}</p>
              <p className="text-sm text-gray-500 mt-2">Category: {item.category}</p>
              {item.packagingOptions && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {item.packagingOptions.map((opt, idx) => (
                    <span key={idx} className="px-2 py-1 rounded-full text-xs bg-emerald-50 text-emerald-700 capitalize">{opt}</span>
                  ))}
                </div>
              )}
              {item.isSeasonal && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-700">Seasonal</span>
                  {typeof item.seasonalRewardPoints === 'number' && item.seasonalRewardPoints > 0 && (
                    <span className="text-xs text-orange-700">+{item.seasonalRewardPoints} pts</span>
                  )}
                </div>
              )}
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => handleEdit(index)}
                  className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-3 rounded text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(index)}
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
        </>
      )}
    </div>
  );
}
