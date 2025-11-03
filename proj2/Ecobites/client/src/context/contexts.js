import { createContext } from 'react';

// Central place to hold raw context objects. Keep these files minimal so
// files that export React components (providers) do not also export plain
// values or helpers which would trip the react-refresh rule.

export const CartContext = createContext(null);
export const RestaurantContext = createContext(null);
