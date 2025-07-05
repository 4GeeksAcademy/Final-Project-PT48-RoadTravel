import { Link } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const Navbar = () => {
  const { store, dispatch } = useGlobalReducer()
  const isAuthenticated = store?.isAuthenticated;

  // const handleLogout = () => {
  //   dispatch({ type: "logout" });
  //   navigate("/login");
  // };
  return (
    <nav className="navbar navbar-expand-lg  nav-bar">
      <div className="container-fluid">
      <Link className="navbar-brand text-white nav-link" to="/">
          Road Travel Rent-a-Car
        </Link>
      <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
      <span className="navbar-toggler-icon"></span>
      </button>
      <div className="container  " id="navbarNavAltMarkup">
        <div className="navbar-nav">
        

        <div className="ml-auto d-flex gap-2 justify-content-end">
          
          
              <Link className=" nav-link" to="/signup">
                <button className="btn btn-primary">Sign Up</button>
              </Link>
              <Link className="nav-link" to="/login">
                <button className="btn btn-success">Login</button>
              </Link>
          
       
          {/* <Link to="/admin">
            <button className="btn btn-outline-warning">Admin</button>
          </Link> */}
          </div>
          </div>
        </div>
      </div>
    </nav>





  );
};