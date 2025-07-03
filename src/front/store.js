export const initialStore = () => {

  const token = localStorage.getItem("token");
  const userData = localStorage.getItem("user");
  let user = null;

  try {
    if (userData) {
      user = JSON.parse(userData);
    }
  } catch (error) {
    console.error("Failed to parse user from localStorage:", error);
    localStorage.removeItem("user");
  }

  return {
    subcompact: [],
    medium: [],
    premium: [],
    favorites: [],
    startDates: [],
    endDates: [],
    token: token,
    user: user,
    isAuthenticated: !!token,
  };

};

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
      const { startDates } = action.payload

      return {
        ...store,
        startDates: startDates
      }

      case "set_endDate":
      const { endDates } = action.payload

      return {
        ...store,
        endDates: endDates
      }

      case "login_success":
      localStorage.setItem("token", action.payload.token);
      localStorage.setItem("user", JSON.stringify(action.payload.user));
      return {
        ...store,
        token: action.payload.token,
        user: action.payload.user,
        isAuthenticated: true,
      };

    case "logout":
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return {
        ...store,
        token: null,
        user: null,
        isAuthenticated: false,
      };

    default:
      throw new Error("Unknown action " + action.type);
  }
}