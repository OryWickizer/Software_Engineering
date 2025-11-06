import axios from 'axios';
import { User } from '../models/User.model.js';

// Geocode address using OpenStreetMap Nominatim
async function geocodeAddress({ street, city, zipCode }) {
  const query = encodeURIComponent(`${street}, ${city}, ${zipCode}`);
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${query}`;
  const response = await axios.get(url, {
    headers: { 'User-Agent': 'EcoBites/1.0 (contact@example.com)' }
  });
  if (response.data && response.data.length > 0) {
    const { lat, lon } = response.data[0];
    return { lat: parseFloat(lat), lng: parseFloat(lon) };
  }
  throw new Error('Address not found');
}

// Geocode address without updating user profile (for one-time orders)
export const geocodeOnly = async (req, res) => {
  try {
    const { street, city, zipCode } = req.body;
    if (!street || !city || !zipCode) {
      return res.status(400).json({ success: false, message: 'Missing address fields' });
    }
    // Geocode
    const coordinates = await geocodeAddress({ street, city, zipCode });
    res.json({ success: true, coordinates });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateAddress = async (req, res) => {
  try {
    const userId = req.user._id;
    const { street, city, zipCode } = req.body;
    if (!street || !city || !zipCode) {
      return res.status(400).json({ success: false, message: 'Missing address fields' });
    }
    // Geocode
    const coordinates = await geocodeAddress({ street, city, zipCode });
    // Update user profile
    const updated = await User.findByIdAndUpdate(
      userId,
      { $set: { 'address.street': street, 'address.city': city, 'address.zipCode': zipCode, 'address.coordinates': coordinates } },
      { new: true }
    ).select('-password');
    if (!updated) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, address: updated.address });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
