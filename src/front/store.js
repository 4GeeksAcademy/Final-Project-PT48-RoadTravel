export const initialStore = () => ({
  subcompact: [],
  medium: [],
  premium: [],
  favorites: [],
  startDates: null, 
  endDates: null,
});

export default function storeReducer(store, action = {}) {
  switch (action.type) {
    case "set_cars":
      if (!["subcompact", "medium", "premium"].includes(action.category)) {
        throw new Error("Unknown category " + action.category);
      }
      return { ...store, [action.category]: action.payload };

    case "newFavorite":
      const exists = store.favorites.some(f => f.license_plate === action.payload.license_plate);
      if (exists) return store;
      return { ...store, favorites: [...store.favorites, action.payload] };

    case "removeFavorite":
      return {
        ...store,
        favorites: store.favorites.filter(f => f.license_plate !== action.payload.license_plate)
      };

    case "set_startDate":

      return {
        ...store,
        startDates: action.payload.startDate, 
      };

    case "set_endDate":

      return {
        ...store,
        endDates: action.payload.endDate,
      };

    default:
      throw new Error("Unknown action " + action.type);
  }
}