export const initialStore = () => ({
  subcompact: [],
  medium: [],
  premium: [],
  favorites: [],
  startDates: null, // Cambia a null o una cadena vacía para una sola fecha
  endDates: null,   // Cambia a null o una cadena vacía para una sola fecha
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
      // Almacena la cadena de fecha real de inicio
      return {
        ...store,
        startDates: action.payload.startDate, // Cambiado de startDates a startDate
      };

    case "set_endDate":
      // Almacena la cadena de fecha real de fin
      return {
        ...store,
        endDates: action.payload.endDate, // Cambiado de endDates a endDate
      };

    default:
      throw new Error("Unknown action " + action.type);
  }
}