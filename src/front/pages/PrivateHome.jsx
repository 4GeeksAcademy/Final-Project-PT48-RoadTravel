import React, { useEffect, useState, useCallback } from "react"; 
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import CardSubcompactCar from "../components/CardSubcompactCar.jsx";
import CardMediumCar from "../components/CardMediumCar.jsx";
import CardPremiumCar from "../components/CardPremiumCar.jsx";
import { NavbarForUsers } from "../components/NavbarForUsers.jsx";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

export default function PrivateHome() {
  const { store, dispatch } = useGlobalReducer();


  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");


  const fetchCars = useCallback(async (category, start = "", end = "") => {
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

  
      let url = `${backendUrl}/api/cars?type=${category}`;
      if (start) {
        url += `&start_date=${start}`;
      }
      if (end) {
        url += `&end_date=${end}`;
      }

      const response = await fetch(url, { headers });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ msg: 'The error could not be parsed.' }));
        throw new Error(`Error loading cars ${category}: ${response.status} ${response.statusText} - ${errorData.msg || 'Unknown message'}`);
      }

      const data = await response.json();
      if (Array.isArray(data)) {
        dispatch({ type: "set_cars", category: category, payload: data });
      } else {
        console.error(`The API for ${category} did not return an array:`, data);
        dispatch({ type: "set_cars", category: category, payload: [] });
      }
    } catch (error) {
      console.error(`Car loading failed ${category}:`, error);
      dispatch({ type: "set_cars", category: category, payload: [] });
    }
  }, [dispatch]); 


  useEffect(() => {
    fetchCars("subcompact");
    fetchCars("medium");
    fetchCars("premium");
    
  }, [fetchCars]); 

  useEffect(() => {
    console.log("Global state (store) updated:", store);
    console.log("filterStartDate en store:", store.startDates);
    console.log("filterEndDate en store:", store.endDates);
  }, [store]); 


  const handleApplyFilters = (e) => {
    e.preventDefault()
    
    dispatch({
      type: "set_startDate",
      payload: {
        startDate: startDate, 
      },
    });
    dispatch({
      type: "set_endDate",
      payload: {
        endDate: endDate, 
      },
    });

    console.log("Applying filters with:", startDate, endDate); 
    fetchCars("subcompact", startDate, endDate);
    fetchCars("medium", startDate, endDate);
    fetchCars("premium", startDate, endDate);
  };

  return (
    <div>
      <NavbarForUsers index= "privatehome" booking="bookinglist" />
      <div className="container my-4">
      <h1 className="mb-4 text-center">Vehicle Catalog</h1>
      {store.user?.role === "client" &&(
      <div className="card p-4 mb-4 shadow-sm">
        <h4 className="mb-3">Choose your dates</h4>
        <form onSubmit={handleApplyFilters}>
        <div className="row g-3 align-items-end">
          <div className="col-md-5">
            <label htmlFor="startDate" className="form-label">Start Date:</label>
            <input 
              type="date" 
              className="form-control" 
              id="startDate" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value) }
              required 
            />
          </div>
          <div className="col-md-5">
            <label htmlFor="endDate" className="form-label">End Date:</label>
            <input 
              type="date" 
              className="form-control" 
              id="endDate" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)} 
              required
            />
          </div>
          <div className="col-md-2 ">
            <input className="btn signup w-100" type="submit" value={"Apply"}/>
              
            
          </div>
        </div>
        </form>
        {(startDate || endDate) && (
          <div className="mt-3 text-end">
            <button className="btn btn-link btn-sm" onClick={() => { setStartDate(""); setEndDate(""); handleApplyFilters(); }}>
              Clean Filters
            </button>
          </div>
        )}
      </div>
      )}

      <h2>Subcompact Cars</h2>
      {store.subcompact.length === 0 ? <p>No cars available in this category for the selected dates.</p> :
        <div className="d-flex flex-wrap">
          {store.subcompact.map(v => <CardSubcompactCar key={v.license_plate} vehicle={v} />)}
        </div>
      }

      <h2>Medium Cars</h2>
      {store.medium.length === 0 ? <p>No cars available in this category for the selected dates.</p> :
        <div className="d-flex flex-wrap">
          {store.medium.map(v => <CardMediumCar key={v.license_plate} vehicle={v} />)}
        </div>
      }

      <h2>Premium Cars</h2>
      {store.premium.length === 0 ? <p>No cars available in this category for the selected dates.</p> :
        <div className="d-flex flex-wrap">
          {store.premium.map(v => <CardPremiumCar key={v.license_plate} vehicle={v} />)}
        </div>
      }
    </div>
</div>

  );
}