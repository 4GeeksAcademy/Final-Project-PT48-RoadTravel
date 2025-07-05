import React from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";

const CardMediumCar = ({ vehicle }) => {
  const nav = useNavigate();
  const { store, dispatch } = useGlobalReducer();
  const fav = store.favorites.some(f => f.license_plate === vehicle.license_plate);
  return (
    <div className="card m-2" style={{width: '240px'}}>
      <img src={vehicle.image_url} style={{height:'140px',objectFit:'cover'}} alt={vehicle.name} /> {/* El admin debe subir la foto */}
      <div className="card-body">
        <h5>{vehicle.make} {vehicle.model} {vehicle.year}</h5>
        <ul>
          <li>License plate: {vehicle.license_plate}</li>
          <li>Color: {vehicle.color}</li>
          <li>Price: ${vehicle.price}/day</li>
        </ul>
        <div className="container text-center">
          {store.startDates && store.endDates &&
        <button className="btn btn-success"
          onClick={() => {
            dispatch({ type: fav ? "removeFavorite" : "newFavorite", payload: vehicle });
            nav('/place-reservation/medium/'+ vehicle.license_plate);
          }}
        >
          Booking
        </button>
        }
        </div>
      </div>
    </div>
  );
};
export default CardMediumCar;