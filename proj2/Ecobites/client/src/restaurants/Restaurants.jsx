import React, { useState } from 'react';

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

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">
        Restaurant Page
      </h1>

      <button 
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={() => setShowForm(!showForm)}
      >
        {showForm ? 'Cancel' : 'Add Item'}
      </button>

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
                onChange={(e) => setMenuItem({...menuItem, name: e.target.value})}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={menuItem.description}
                onChange={(e) => setMenuItem({...menuItem, description: e.target.value})}
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
                onChange={(e) => setMenuItem({...menuItem, price: e.target.value})}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <input
                type="text"
                value={menuItem.category}
                onChange={(e) => setMenuItem({...menuItem, category: e.target.value})}
                className="w-full px-3 py-2 border rounded"
                required
              />
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
        <h2 className="text-2xl font-bold mb-4">Menu Items</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {menuItems.map((item, index) => (
            <div key={index} className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-2">{item.name}</h3>
              <p className="text-gray-600 mb-2">{item.description}</p>
              <p className="text-lg font-bold text-green-600">${item.price}</p>
              <p className="text-sm text-gray-500 mt-2">Category: {item.category}</p>
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
    </div>
  );
};

export default Restaurant;
