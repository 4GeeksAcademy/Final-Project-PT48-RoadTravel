import { Link } from "react-router-dom";


export const NavbarForUsers = (prop) => {
  return (
    <nav className="navbar navbar-expand-lg navbar-light nav-bar">
      <div className="container ">
        <Link className="navbar-brand" to="/">
          Road Travel Rent-a-Car
        </Link>

        <div className="ml-auto d-flex gap-2">
          <Link to={`/${prop.home}`}>
            <button className="btn btn-primary">Home</button>
          </Link>
          <Link to={`/${prop.booking}`}>
            <button className="btn btn-success">My Bookings</button>
          </Link>
          <Link to="/">
            <button className="btn btn-danger border">LogOut</button>
          </Link>
          
        </div>
      </div>
    </nav>
  );
};