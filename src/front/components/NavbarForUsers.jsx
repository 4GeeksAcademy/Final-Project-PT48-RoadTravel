import { Link } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { useNavigate } from 'react-router-dom';


export const NavbarForUsers = (prop) => {
  const { store, dispatch } = useGlobalReducer();
  const isAuthenticated = store?.isAuthenticated;
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch({ type: "logout" });
    navigate("/");
    
  };
  return (
     <nav className="navbar navbar-expand-lg nav-bar">
      <div className="container">
        <Link className="navbar-brand text-white nav-link" to={`/${prop.index}`}>
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

        <div className="collapse navbar-collapse my-3" id="navbarContent">
          <div className="navbar-nav ms-auto">  {/* ms-auto para alinear a la derecha */}
            <div className="d-flex gap-2">
          {/* <Link to={`/${prop.inicial}`}>
            <button className="btn btn-primary">Home</button>
          </Link> */}
          {store.user?.role === "administrator" &&(
        <Link to="/admin">
            <button className="btn btn-primary">Add Vehicle</button>
          </Link>
        )}
          <Link to={`/${prop.booking}`}>
            <button className="btn btn-success">My Bookings</button>
          </Link>
          {isAuthenticated && (
            <button className="btn btn-danger border" onClick={handleLogout }>
              Logout
            </button>
          )}
          
        </div>
      </div>
      </div>
      </div>
    </nav>
  );
};


// import { Link, Navigate } from "react-router-dom";
// import useGlobalReducer from "../hooks/useGlobalReducer";

// export const NavbarForUsers = () => {
//   const { store, dispatch } = useGlobalReducer();
//   const isAuthenticated = store?.isAuthenticated;

//   const handleLogout = () => {
//     dispatch({ type: "logout" });
//     navigate("/login");
//   };

//   return (
//     <nav className="navbar navbar-expand-lg navbar-light bg-light">
//       <div className="container">
//         <Link className="navbar-brand" to="/">
//           Road Travel Rent-a-Car
//         </Link>

//         <div className="ml-auto d-flex gap-2">
//           {!isAuthenticated && (
//             <>
//               <Link to="/signup">
//                 <button className="btn btn-outline-primary">Sign Up</button>
//               </Link>
//               <Link to="/login">
//                 <button className="btn btn-outline-success">Login</button>
//               </Link>
//             </>
//           )}
//           {isAuthenticated && (
//             <button className="btn btn-outline-danger" onClick={handleLogout}>
//               Logout
//             </button>
//           )}
//           <Link to="/admin">
//             <button className="btn btn-outline-warning">Admin</button>
//           </Link>
//         </div>
//       </div>
//     </nav>
//   );
// };