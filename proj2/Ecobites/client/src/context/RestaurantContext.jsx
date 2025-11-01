import { createContext, useContext, useState } from "react";
import { restaurantService } from "../api/services/restaurant.service";

const RestaurantContext = createContext();

export const RestaurantProvider = ({ children }) => {
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [menu, setMenu] = useState([]);

  

  // fetch menu for selected restaurant
  const fetchMenu = async (restaurantId) => {
    const data = await restaurantService.getById(restaurantId);
    setMenu(data);
  };


  return (
    <RestaurantContext.Provider
      value={{
        selectedRestaurant,
        setSelectedRestaurant,
        menu,
        fetchMenu,
      }}
    >
      {children}
    </RestaurantContext.Provider>
  );
};

export const useRestaurantContext = () => useContext(RestaurantContext);