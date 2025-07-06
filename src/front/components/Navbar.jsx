import { Link } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const Navbar = () => {
  const { store, dispatch } = useGlobalReducer()
  const isAuthenticated = store?.isAuthenticated;

  return (
    <nav className="navbar navbar-expand-lg nav-bar">
      <div className="container">
        <Link className="navbar-brand text-white nav-link" to="/">
          Road Travel Rent-a-Car
        </Link>
        
        {/* Botón Hamburguesa */}
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarContent" 
          aria-controls="navbarContent" 
          aria-expanded="false" 
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        
        {/* Contenido colapsable */}
        <div className="collapse navbar-collapse" id="navbarContent">
          <div className="navbar-nav ms-auto">  {/* ms-auto para alinear a la derecha */}
            <div className="d-flex gap-2">
              <Link className="nav-link" to="/signup">
                <button className="btn btn-primary">Sign Up</button>
              </Link>
              <Link className="nav-link" to="/login">
                <button className="btn btn-success">Login</button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};