import React from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";

const CardSubcompactCar = ({ vehicle }) => {
  const nav = useNavigate();
  const handleCleanFilters = () => {
   
    setStartDate("");
    setEndDate("");


    dispatch({
      type: "set_startDate",
      payload: {
        startDate: "",
      },
    });
    dispatch({
      type: "set_endDate",
      payload: {
        endDate: "",
      },
    });

    
    fetchCars("subcompact", "", "");
    fetchCars("medium", "", "");
    fetchCars("premium", "", "");
  };
  const { store, dispatch } = useGlobalReducer();
  const fav = store.favorites.some(f => f.license_plate === vehicle.license_plate);
  return (
    <div className="card m-2" style={{width: '240px'}}>
      <img src={vehicle.image_url} style={{height:'140px',objectFit:'cover'}} alt={vehicle.name} /> 
      <div className="card-body">
        <h5>{vehicle.make} {vehicle.model} {vehicle.year}</h5>
        <ul>
          
          
          
          <li>License Plate: {vehicle.license_plate}</li>
          <li>Color: {vehicle.color}</li>
          <li>Price: ${vehicle.price}/day</li>
        </ul>
        <div className="container text-center">
        {store.startDates && store.endDates &&
        <button className="btn booking-button navbar-button-login"
          onClick={() => {
            dispatch({ type: fav ? "removeFavorite" : "newFavorite", payload: vehicle });
            nav('/place-reservation/subcompact/'+ vehicle.license_plate );
            handleCleanFilters;
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

export default CardSubcompactCar;