import { MenuItem } from '../models/MenuItem.model.js';
import { User } from '../models/User.model.js';

export const createMenuItem = async (req, res) => {
  try {
    let { restaurantId, name, description, price, category, image, preparationTime, packagingOptions } = req.body;

    // If restaurantId not supplied, and the authenticated user is a restaurant, use their id
    if (!restaurantId && req.user && req.user.role === 'restaurant') {
      restaurantId = req.user._id.toString();
    }

    // Verify restaurant exists and user owns it
    const restaurant = restaurantId ? await User.findById(restaurantId) : null;
    if (!restaurant || restaurant.role !== 'restaurant') {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    if (req.user.role === 'restaurant' && req.user._id.toString() !== restaurantId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add items to this restaurant'
      });
    }
    
    const menuItem = new MenuItem({
      restaurantId,
      name,
      description,
      price,
      category,
      image,
      preparationTime,
      packagingOptions
    });
    
    await menuItem.save();

    // Return the created menu item directly (test expectations)
    res.status(201).json(menuItem);
  } catch (error) {
    console.error('getMenuByRestaurant error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getMenuByRestaurant = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    
    const menuItems = await MenuItem.find({ restaurantId, isAvailable: true })
      .sort({ category: 1, name: 1 });
    
    // Return array of menu items directly to match test expectations
    res.json(menuItems);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    
    const menuItem = await MenuItem.findById(id);
    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }
    
    if (req.user.role === 'restaurant' && req.user._id.toString() !== menuItem.restaurantId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this menu item'
      });
    }
    
    const updated = await MenuItem.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.json({
      success: true,
      message: 'Menu item updated successfully',
      data: updated
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    
    const menuItem = await MenuItem.findById(id);
    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }
    
    if (req.user.role === 'restaurant' && req.user._id.toString() !== menuItem.restaurantId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this menu item'
      });
    }
    
    await MenuItem.findByIdAndDelete(id);
    
    res.json({
      success: true,
      message: 'Menu item deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};