import { Link } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";


export const NavbarForUsers = (prop) => {
  const { store, dispatch } = useGlobalReducer();
  const isAuthenticated = store?.isAuthenticated;

  const handleLogout = () => {
    dispatch({ type: "logout" });
    navigate("/login");
  };


  return (
    <nav className="navbar navbar-expand-lg navbar-light nav-bar">
      <div className="container ">
        <Link className="navbar-brand" to="/">
          Road Travel Rent-a-Car
        </Link>

         <div className="ml-auto d-flex gap-2">

          <Link to={`/${prop.inicial}`}>
            <button className="btn btn-primary">Home</button>
          </Link>
          <Link to={`/${prop.booking}`}>
            <button className="btn btn-success">My Bookings</button>
          </Link>

          {!isAuthenticated && (
            <>
              <Link to="/signup">
                <button className="btn btn-outline-primary">Sign Up</button>
              </Link>
              <Link to="/login">
                <button className="btn btn-outline-success">Login</button>
              </Link>
            </>
          )}
          {isAuthenticated && (
            <button className="btn btn-outline-danger" onClick={handleLogout}>
              Logout
            </button>
          )}
          <Link to="/admin">
            <button className="btn btn-outline-warning">Admin</button>
          </Link>
        </div>
      </div>
    </nav>
  );
};